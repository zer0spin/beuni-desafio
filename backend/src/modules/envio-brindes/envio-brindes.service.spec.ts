import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EnvioBrindesService } from './envio-brindes.service';
import { PrismaService } from '../../shared/prisma.service';
import { BusinessDaysService } from './business-days.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('EnvioBrindesService', () => {
  let service: EnvioBrindesService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let businessDaysService: any;

  const organizationId = 'org-123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh mocks for each test
    prisma = createMockPrismaService();
    businessDaysService = {
      calculateBusinessDaysBefore: vi.fn(),
      calculateBusinessDaysAfter: vi.fn(),
      isBusinessDay: vi.fn(),
      getBusinessDaysCount: vi.fn(),
    };

    // Create the service directly with mocks
    service = new EnvioBrindesService(prisma as any, businessDaysService);
  });

  describe('verificarAniversariosProximos', () => {
    it('should process birthday reminders and mark ready for shipping', async () => {
      // Arrange
      const mockColaborador = {
        id: 'colab-123',
        nomeCompleto: 'João Silva',
        dataNascimento: new Date('1990-06-15'),
        organizationId: 'org-123',
        enviosBrinde: [],
      };

      const mockDate = new Date('2024-06-08'); // 7 dias antes do aniversário
      vi.setSystemTime(mockDate);

      prisma.colaborador.findMany.mockResolvedValue([mockColaborador]);
      businessDaysService.calculateBusinessDaysBefore.mockReturnValue(mockDate);
      prisma.envioBrinde.findUnique.mockResolvedValue(null);
      prisma.envioBrinde.create.mockResolvedValue({
        id: 'envio-123',
        colaboradorId: 'colab-123',
        status: 'PENDENTE',
        anoAniversario: 2024,
      });
      prisma.envioBrinde.update.mockResolvedValue({
        id: 'envio-123',
        status: 'PRONTO_PARA_ENVIO',
        dataGatilhoEnvio: mockDate,
      });

      // Act
      await service.verificarAniversariosProximos();

      // Assert
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith({
        include: {
          enviosBrinde: {
            where: {
              anoAniversario: 2024,
            },
          },
        },
      });
      expect(businessDaysService.calculateBusinessDaysBefore).toHaveBeenCalled();
    });

    it('should not create duplicate envio records for same year', async () => {
      // Arrange
      const mockColaborador = {
        id: 'colab-123',
        dataNascimento: new Date('1990-06-15'),
        enviosBrinde: [{
          id: 'envio-existing',
          anoAniversario: 2024,
          status: 'PENDENTE',
        }],
      };

      prisma.colaborador.findMany.mockResolvedValue([mockColaborador]);
      
      // Act
      await service.verificarAniversariosProximos();

      // Assert
      expect(prisma.envioBrinde.create).not.toHaveBeenCalled();
    });

    it('should handle errors during processing gracefully', async () => {
      // Arrange
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      prisma.colaborador.findMany.mockRejectedValue(new Error('Database error'));

      // Act
      await service.verificarAniversariosProximos();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Erro na verificação de aniversários:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('buscarEnvios', () => {
    it('should return paginated envios with default parameters', async () => {
      // Arrange
      const mockEnvios = [
        {
          id: 'envio-1',
          status: 'PRONTO_PARA_ENVIO',
          anoAniversario: 2024,
          colaborador: {
            nomeCompleto: 'João Silva',
            organizationId: 'org-123',
            endereco: { cep: '12345-678' },
            organizacao: { nome: 'Test Org' },
          },
        },
      ];

      prisma.envioBrinde.findMany.mockResolvedValue(mockEnvios);
      prisma.envioBrinde.count.mockResolvedValue(1);

      // Act
      const result = await service.buscarEnvios(organizationId);

      // Assert
      expect(result).toEqual({
        envios: mockEnvios,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prisma.envioBrinde.findMany).toHaveBeenCalledWith({
        where: {
          anoAniversario: expect.any(Number),
          colaborador: { organizationId },
        },
        include: {
          colaborador: {
            include: {
              endereco: true,
              organizacao: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { dataGatilhoEnvio: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: 0,
        take: 10,
      });
    });

    it('should filter by status when provided', async () => {
      // Arrange
      prisma.envioBrinde.findMany.mockResolvedValue([]);
      prisma.envioBrinde.count.mockResolvedValue(0);

      // Act
      await service.buscarEnvios(organizationId, { 
        status: 'ENVIADO',
        page: 2,
        limit: 5,
      });

      // Assert
      expect(prisma.envioBrinde.findMany).toHaveBeenCalledWith({
        where: {
          anoAniversario: expect.any(Number),
          colaborador: { organizationId },
          status: 'ENVIADO',
        },
        include: expect.any(Object),
        orderBy: expect.any(Array),
        skip: 5,
        take: 5,
      });
    });

    it('should filter by colaboradorId when provided', async () => {
      // Arrange
      prisma.envioBrinde.findMany.mockResolvedValue([]);
      prisma.envioBrinde.count.mockResolvedValue(0);

      // Act
      await service.buscarEnvios(organizationId, { 
        colaboradorId: 'colab-123',
        ano: 2023,
      });

      // Assert
      expect(prisma.envioBrinde.findMany).toHaveBeenCalledWith({
        where: {
          anoAniversario: 2023,
          colaborador: { organizationId },
          colaboradorId: 'colab-123',
        },
        include: expect.any(Object),
        orderBy: expect.any(Array),
        skip: 0,
        take: 10,
      });
    });

    it('should limit maximum items per page to 100', async () => {
      // Arrange
      prisma.envioBrinde.findMany.mockResolvedValue([]);
      prisma.envioBrinde.count.mockResolvedValue(0);

      // Act
      await service.buscarEnvios(organizationId, { limit: 200 });

      // Assert
      expect(prisma.envioBrinde.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });
  });

  describe('buscarEnviosProntosParaEnvio', () => {
    it('should return envios with PRONTO_PARA_ENVIO status', async () => {
      // Arrange
      const mockEnvios = [
        {
          id: 'envio-1',
          status: 'PRONTO_PARA_ENVIO',
          colaborador: {
            nomeCompleto: 'João Silva',
            endereco: { cep: '12345-678' },
            organizacao: { nome: 'Test Org' },
          },
        },
      ];

      prisma.envioBrinde.findMany.mockResolvedValue(mockEnvios);

      // Act
      const result = await service.buscarEnviosProntosParaEnvio();

      // Assert
      expect(result).toEqual(mockEnvios);
      expect(prisma.envioBrinde.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PRONTO_PARA_ENVIO',
        },
        include: {
          colaborador: {
            include: {
              endereco: true,
              organizacao: true,
            },
          },
        },
        orderBy: {
          dataGatilhoEnvio: 'asc',
        },
      });
    });

    it('should return empty array when no envios ready for shipping', async () => {
      // Arrange
      prisma.envioBrinde.findMany.mockResolvedValue([]);

      // Act
      const result = await service.buscarEnviosProntosParaEnvio();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('marcarEnvioRealizado', () => {
    it('should mark envio as ENVIADO with current date', async () => {
      // Arrange
      const envioBrindeId = 'envio-123';
      const observacoes = 'Entregue ao porteiro';
      const mockDate = new Date();
      vi.setSystemTime(mockDate);

      const updatedEnvio = {
        id: envioBrindeId,
        status: 'ENVIADO',
        dataEnvioRealizado: mockDate,
        observacoes,
      };

      prisma.envioBrinde.update.mockResolvedValue(updatedEnvio);

      // Act
      const result = await service.marcarEnvioRealizado(envioBrindeId, observacoes);

      // Assert
      expect(result).toEqual(updatedEnvio);
      expect(prisma.envioBrinde.update).toHaveBeenCalledWith({
        where: { id: envioBrindeId },
        data: {
          status: 'ENVIADO',
          dataEnvioRealizado: mockDate,
          observacoes,
        },
      });
    });

    it('should mark envio as ENVIADO without observacoes', async () => {
      // Arrange
      const envioBrindeId = 'envio-123';
      prisma.envioBrinde.update.mockResolvedValue({});

      // Act
      await service.marcarEnvioRealizado(envioBrindeId);

      // Assert
      expect(prisma.envioBrinde.update).toHaveBeenCalledWith({
        where: { id: envioBrindeId },
        data: {
          status: 'ENVIADO',
          dataEnvioRealizado: expect.any(Date),
          observacoes: undefined,
        },
      });
    });
  });

  describe('atualizarStatusEnvio', () => {
    it('should update envio status when envio exists and belongs to organization', async () => {
      // Arrange
      const envioBrindeId = 'envio-123';
      const novoStatus = 'ENVIADO';
      const observacoes = 'Pacote entregue';

      const mockEnvio = {
        id: envioBrindeId,
        status: 'PRONTO_PARA_ENVIO',
        colaborador: {
          id: 'colab-123',
          organizationId: 'org-123',
        },
      };

      const updatedEnvio = {
        ...mockEnvio,
        status: novoStatus,
        dataEnvioRealizado: expect.any(Date),
        observacoes,
      };

      prisma.envioBrinde.findFirst.mockResolvedValue(mockEnvio);
      prisma.envioBrinde.update.mockResolvedValue(updatedEnvio);

      // Act
      const result = await service.atualizarStatusEnvio(envioBrindeId, novoStatus, organizationId, observacoes);

      // Assert
      expect(result).toEqual(updatedEnvio);
      expect(prisma.envioBrinde.findFirst).toHaveBeenCalledWith({
        where: {
          id: envioBrindeId,
          colaborador: { organizationId },
        },
        include: { colaborador: true },
      });
      expect(prisma.envioBrinde.update).toHaveBeenCalledWith({
        where: { id: envioBrindeId },
        data: {
          status: novoStatus,
          observacoes,
          dataEnvioRealizado: expect.any(Date),
        },
        include: {
          colaborador: {
            include: { endereco: true },
          },
        },
      });
    });

    it('should add dataGatilhoEnvio when status is PRONTO_PARA_ENVIO', async () => {
      // Arrange
      const envioBrindeId = 'envio-123';
      const novoStatus = 'PRONTO_PARA_ENVIO';

      const mockEnvio = {
        id: envioBrindeId,
        colaborador: { organizationId: 'org-123' },
      };

      prisma.envioBrinde.findFirst.mockResolvedValue(mockEnvio);
      prisma.envioBrinde.update.mockResolvedValue({});

      // Act
      await service.atualizarStatusEnvio(envioBrindeId, novoStatus, organizationId);

      // Assert
      expect(prisma.envioBrinde.update).toHaveBeenCalledWith({
        where: { id: envioBrindeId },
        data: {
          status: novoStatus,
          observacoes: undefined,
          dataGatilhoEnvio: expect.any(Date),
        },
        include: expect.any(Object),
      });
    });

    it('should throw error when envio not found or does not belong to organization', async () => {
      // Arrange
      const envioBrindeId = 'envio-123';
      const novoStatus = 'ENVIADO';

      prisma.envioBrinde.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.atualizarStatusEnvio(envioBrindeId, novoStatus, organizationId))
        .rejects.toThrow('Envio não encontrado');
    });
  });

  describe('buscarEstatisticasEnvios', () => {
    it('should return statistics grouped by status for current year', async () => {
      // Arrange
      const currentYear = new Date().getFullYear();
      const mockStats = [
        { status: 'PENDENTE', _count: { status: 5 } },
        { status: 'ENVIADO', _count: { status: 10 } },
      ];

      prisma.envioBrinde.groupBy.mockResolvedValue(mockStats);
      prisma.envioBrinde.count.mockResolvedValue(15);

      // Act
      const result = await service.buscarEstatisticasEnvios(organizationId);

      // Assert
      expect(result).toEqual({
        ano: currentYear,
        total: 15,
        porStatus: {
          PENDENTE: 5,
          ENVIADO: 10,
        },
      });
      expect(prisma.envioBrinde.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          anoAniversario: currentYear,
          colaborador: { organizationId },
        },
        _count: { status: true },
      });
    });

    it('should return statistics for specific year when provided', async () => {
      // Arrange
      const ano = 2023;
      prisma.envioBrinde.groupBy.mockResolvedValue([]);
      prisma.envioBrinde.count.mockResolvedValue(0);

      // Act
      const result = await service.buscarEstatisticasEnvios(organizationId, ano);

      // Assert
      expect(result.ano).toBe(ano);
      expect(prisma.envioBrinde.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          anoAniversario: ano,
          colaborador: { organizationId },
        },
        _count: { status: true },
      });
    });
  });

  describe('buscarRelatorios', () => {
    it('should return comprehensive report with all statistics', async () => {
      // Arrange
      const ano = 2024;
      const mockStats = [
        { status: 'ENVIADO', _count: { status: 8 } },
        { status: 'PENDENTE', _count: { status: 2 } },
      ];
      
      const mockColaboradoresComEnvios = [
        {
          dataNascimento: new Date('1990-06-15'),
          enviosBrinde: [{ status: 'ENVIADO' }],
        },
        {
          dataNascimento: new Date('1985-12-25'),
          enviosBrinde: [{ status: 'PENDENTE' }],
        },
      ];

      prisma.colaborador.count
        .mockResolvedValueOnce(50) // totalColaboradores
        .mockResolvedValueOnce(10); // aniversariantesEsteAno
      
      prisma.envioBrinde.groupBy.mockResolvedValue(mockStats);
      prisma.colaborador.findMany.mockResolvedValue(mockColaboradoresComEnvios);

      // Act
      const result = await service.buscarRelatorios(organizationId, ano);

      // Assert
      expect(result).toEqual({
        totalColaboradores: 50,
        aniversariantesEsteAno: 10,
        enviosPorStatus: {
          PENDENTE: 2,
          PRONTO_PARA_ENVIO: 0,
          ENVIADO: 8,
          ENTREGUE: 0,
          CANCELADO: 0,
        },
        enviosPorMes: expect.arrayContaining([
          expect.objectContaining({
            mes: 6,
            nomeDoMes: 'Junho',
            total: 1,
            enviados: 1,
            pendentes: 0,
          }),
          expect.objectContaining({
            mes: 12,
            nomeDoMes: 'Dezembro',
            total: 1,
            enviados: 0,
            pendentes: 1,
          }),
        ]),
      });
    });

    it('should calculate monthly distributions correctly', async () => {
      // Arrange
      const ano = 2024;
      const mockColaboradoresComEnvios = [
        {
          dataNascimento: new Date('1990-01-15'), // Janeiro
          enviosBrinde: [{ status: 'ENVIADO' }],
        },
        {
          dataNascimento: new Date('1985-01-20'), // Janeiro
          enviosBrinde: [{ status: 'PENDENTE' }],
        },
      ];

      prisma.colaborador.count.mockResolvedValue(10);
      prisma.envioBrinde.groupBy.mockResolvedValue([]);
      prisma.colaborador.findMany.mockResolvedValue(mockColaboradoresComEnvios);

      // Act
      const result = await service.buscarRelatorios(organizationId, ano);

      // Assert
      const janeiroStats = result.enviosPorMes.find(m => m.mes === 1);
      expect(janeiroStats).toEqual({
        mes: 1,
        nomeDoMes: 'Janeiro',
        total: 2,
        enviados: 1,
        pendentes: 1,
      });
    });
  });

  describe('simularProcessamento', () => {
    it('should simulate processing and return success message', async () => {
      // Arrange
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(service, 'verificarAniversariosProximos').mockResolvedValue();

      // Act
      const result = await service.simularProcessamento();

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Processamento simulado executado',
      });
      expect(service.verificarAniversariosProximos).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('🧪 Simulando processamento de aniversários...');
      consoleLogSpy.mockRestore();
    });
  });

  describe('criarRegistrosParaNovoAno', () => {
    it('should create envio records for new year when none exist', async () => {
      // Arrange
      const ano = 2025;
      const mockColaboradores = [
        { id: 'colab-1', nomeCompleto: 'João' },
        { id: 'colab-2', nomeCompleto: 'Maria' },
      ];

      prisma.colaborador.findMany.mockResolvedValue(mockColaboradores);
      prisma.envioBrinde.findUnique.mockResolvedValue(null);
      prisma.envioBrinde.create.mockResolvedValue({
        id: 'envio-new',
        status: 'PENDENTE',
        anoAniversario: ano,
      });

      // Act
      const result = await service.criarRegistrosParaNovoAno(ano);

      // Assert
      expect(result).toEqual({
        ano,
        registrosCriados: 2,
        totalColaboradores: 2,
      });
      expect(prisma.envioBrinde.create).toHaveBeenCalledTimes(2);
      expect(prisma.envioBrinde.create).toHaveBeenCalledWith({
        data: {
          colaboradorId: 'colab-1',
          anoAniversario: ano,
          status: 'PENDENTE',
        },
      });
      expect(prisma.envioBrinde.create).toHaveBeenCalledWith({
        data: {
          colaboradorId: 'colab-2',
          anoAniversario: ano,
          status: 'PENDENTE',
        },
      });
    });

    it('should not create duplicate records for existing year', async () => {
      // Arrange
      const ano = 2025;
      const mockColaboradores = [{ id: 'colab-1' }];

      prisma.colaborador.findMany.mockResolvedValue(mockColaboradores);
      prisma.envioBrinde.findUnique.mockResolvedValue({
        id: 'existing-envio',
        colaboradorId: 'colab-1',
        anoAniversario: ano,
      });

      // Act
      const result = await service.criarRegistrosParaNovoAno(ano);

      // Assert
      expect(result).toEqual({
        ano,
        registrosCriados: 0,
        totalColaboradores: 1,
      });
      expect(prisma.envioBrinde.create).not.toHaveBeenCalled();
    });

    it('should handle mixed scenario with some existing and some new records', async () => {
      // Arrange
      const ano = 2025;
      const mockColaboradores = [
        { id: 'colab-1', nomeCompleto: 'João' },
        { id: 'colab-2', nomeCompleto: 'Maria' },
      ];

      prisma.colaborador.findMany.mockResolvedValue(mockColaboradores);
      
      // colab-1 already has record, colab-2 doesn't
      prisma.envioBrinde.findUnique
        .mockResolvedValueOnce({ id: 'existing', colaboradorId: 'colab-1' })
        .mockResolvedValueOnce(null);
      
      prisma.envioBrinde.create.mockResolvedValue({
        id: 'new-envio',
        colaboradorId: 'colab-2',
        anoAniversario: ano,
        status: 'PENDENTE',
      });

      // Act
      const result = await service.criarRegistrosParaNovoAno(ano);

      // Assert
      expect(result).toEqual({
        ano,
        registrosCriados: 1,
        totalColaboradores: 2,
      });
      expect(prisma.envioBrinde.create).toHaveBeenCalledTimes(1);
      expect(prisma.envioBrinde.create).toHaveBeenCalledWith({
        data: {
          colaboradorId: 'colab-2',
          anoAniversario: ano,
          status: 'PENDENTE',
        },
      });
    });
  });

  describe('deleteAllShipments', () => {
    it('should delete all shipments for organization', async () => {
      // Arrange
      const deletedCount = 15;
      
      prisma.envioBrinde.deleteMany.mockResolvedValue({ count: deletedCount });

      // Act
      const result = await service.deleteAllShipments(organizationId);

      // Assert
      expect(result).toEqual({
        message: 'All shipments deleted successfully',
        deletedCount,
      });
      expect(prisma.envioBrinde.deleteMany).toHaveBeenCalledWith({
        where: {
          colaborador: {
            organizationId,
          },
        },
      });
    });

    it('should return zero count when no shipments exist', async () => {
      // Arrange
      prisma.envioBrinde.deleteMany.mockResolvedValue({ count: 0 });

      // Act
      const result = await service.deleteAllShipments(organizationId);

      // Assert
      expect(result).toEqual({
        message: 'All shipments deleted successfully',
        deletedCount: 0,
      });
    });

    it('should enforce organization isolation in delete operation', async () => {
      // Arrange
      const differentOrgId = 'org-456';
      prisma.envioBrinde.deleteMany.mockResolvedValue({ count: 5 });

      // Act
      await service.deleteAllShipments(differentOrgId);

      // Assert
      expect(prisma.envioBrinde.deleteMany).toHaveBeenCalledWith({
        where: {
          colaborador: {
            organizationId: differentOrgId,
          },
        },
      });
    });
  });
});