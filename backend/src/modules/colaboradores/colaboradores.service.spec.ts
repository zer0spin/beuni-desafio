import { NotFoundException, BadRequestException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ColaboradoresService } from './colaboradores.service';
import { PrismaService } from '../../shared/prisma.service';
import { CepService } from '../cep/cep.service';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';
import { mockColaborador, mockEndereco, createColaboradorDto, updateColaboradorDto } from '../../../test/fixtures/colaborador.fixture';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { ListColaboradoresDto } from './dto/list-colaboradores.dto';

// Mock CepService
const mockCepService = {
  consultarCep: vi.fn(),
  limparCache: vi.fn(),
  obterEstatisticasCache: vi.fn(),
};

describe('ColaboradoresService', () => {
  let service: ColaboradoresService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let cepService: typeof mockCepService;

  const organizationId = 'org-123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh mocks for each test
    prisma = createMockPrismaService();
    cepService = {
      consultarCep: vi.fn(),
      limparCache: vi.fn(),
      obterEstatisticasCache: vi.fn(),
    };

    // Create the service directly with mocks to avoid NestJS DI issues
    service = new ColaboradoresService(prisma as any, cepService as any);
  });

  describe('create', () => {
    it('should create colaborador with valid CEP', async () => {
      // Arrange
      const dto: CreateColaboradorDto = createColaboradorDto;

      const mockCepData = {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
      };

      cepService.consultarCep.mockResolvedValue(mockCepData);

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          endereco: {
            create: vi.fn().mockResolvedValue(mockEndereco),
          },
          colaborador: {
            create: vi.fn().mockResolvedValue({
              ...mockColaborador,
              endereco: mockEndereco,
              enviosBrinde: [],
            }),
          },
          envioBrinde: {
            create: vi.fn().mockResolvedValue({
              id: 'envio-123',
              colaboradorId: mockColaborador.id,
              anoAniversario: new Date().getFullYear(),
              status: 'PENDENTE',
            }),
          },
        });
      });

      // Act
      const result = await service.create(dto, organizationId);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.nome_completo).toBe(dto.nome_completo);
      expect(cepService.consultarCep).toHaveBeenCalledWith(dto.endereco.cep);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid CEP', async () => {
      // Arrange
      const dto: CreateColaboradorDto = createColaboradorDto;
      cepService.consultarCep.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create(dto, organizationId)
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create(dto, organizationId)
      ).rejects.toThrow('CEP não encontrado');
    });

    it('should create EnvioBrinde for current year', async () => {
      // Arrange
      const dto: CreateColaboradorDto = createColaboradorDto;
      const mockCepData = {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
      };

      cepService.consultarCep.mockResolvedValue(mockCepData);

      const mockEnvioBrindeCreate = vi.fn();

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          endereco: { create: vi.fn().mockResolvedValue(mockEndereco) },
          colaborador: { create: vi.fn().mockResolvedValue({ ...mockColaborador, endereco: mockEndereco }) },
          envioBrinde: { create: mockEnvioBrindeCreate },
        });
      });

      // Act
      await service.create(dto, organizationId);

      // Assert
      expect(mockEnvioBrindeCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          anoAniversario: new Date().getFullYear(),
          status: 'PENDENTE',
        }),
      });
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const dto: CreateColaboradorDto = createColaboradorDto;
      const mockCepData = {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
      };

      cepService.consultarCep.mockResolvedValue(mockCepData);
      prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      // Act & Assert
      await expect(
        service.create(dto, organizationId)
      ).rejects.toThrow('Transaction failed');
    });

    it('should convert date string to Date object', async () => {
      // Arrange
      const dto: CreateColaboradorDto = createColaboradorDto;
      const mockCepData = {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
      };

      cepService.consultarCep.mockResolvedValue(mockCepData);

      const mockColaboradorCreate = vi.fn().mockResolvedValue({
        ...mockColaborador,
        endereco: mockEndereco,
      });

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          endereco: { create: vi.fn().mockResolvedValue(mockEndereco) },
          colaborador: { create: mockColaboradorCreate },
          envioBrinde: { create: vi.fn() },
        });
      });

      // Act
      await service.create(dto, organizationId);

      // Assert
      expect(mockColaboradorCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dataNascimento: expect.any(Date),
        }),
        include: { endereco: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated list of colaboradores', async () => {
      // Arrange
      const query: ListColaboradoresDto = { page: 1, limit: 10 };

      const mockColaboradores = [
        { ...mockColaborador, endereco: mockEndereco, enviosBrinde: [] },
      ];

      prisma.colaborador.findMany.mockResolvedValue(mockColaboradores);
      prisma.colaborador.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll(query, organizationId);

      // Assert
      expect(result).toHaveProperty('colaboradores');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages', 1);
      expect(result.colaboradores).toHaveLength(1);
    });

    it('should filter by month', async () => {
      // Arrange
      const query: ListColaboradoresDto = { mes: 5, page: 1, limit: 10 };

      prisma.colaborador.findMany.mockResolvedValue([]);
      prisma.colaborador.count.mockResolvedValue(0);

      // Act
      await service.findAll(query, organizationId);

      // Assert
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dataNascimento: expect.objectContaining({
              gte: expect.any(Date),
              lt: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should filter by departamento', async () => {
      // Arrange
      const query: ListColaboradoresDto = { departamento: 'TI', page: 1, limit: 10 };

      prisma.colaborador.findMany.mockResolvedValue([]);
      prisma.colaborador.count.mockResolvedValue(0);

      // Act
      await service.findAll(query, organizationId);

      // Assert
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departamento: {
              contains: 'TI',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should include current year enviosBrinde', async () => {
      // Arrange
      const query: ListColaboradoresDto = { page: 1, limit: 10 };

      prisma.colaborador.findMany.mockResolvedValue([]);
      prisma.colaborador.count.mockResolvedValue(0);

      // Act
      await service.findAll(query, organizationId);

      // Assert
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            enviosBrinde: expect.objectContaining({
              where: {
                anoAniversario: new Date().getFullYear(),
              },
            }),
          }),
        })
      );
    });

    it('should calculate correct pagination', async () => {
      // Arrange
      const query: ListColaboradoresDto = { page: 2, limit: 5 };

      prisma.colaborador.findMany.mockResolvedValue([]);
      prisma.colaborador.count.mockResolvedValue(12);

      // Act
      const result = await service.findAll(query, organizationId);

      // Assert
      expect(result.totalPages).toBe(3); // ceil(12/5)
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (2-1) * 5
          take: 5,
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return colaborador by id', async () => {
      // Arrange
      const id = 'colab-123';
      const mockColaboradorData = {
        ...mockColaborador,
        endereco: mockEndereco,
        enviosBrinde: [],
      };

      prisma.colaborador.findFirst.mockResolvedValue(mockColaboradorData);

      // Act
      const result = await service.findOne(id, organizationId);

      // Assert
      expect(result).toHaveProperty('id', id);
      expect(prisma.colaborador.findFirst).toHaveBeenCalledWith({
        where: { id, organizationId },
        include: expect.objectContaining({
          endereco: true,
        }),
      });
    });

    it('should throw NotFoundException for invalid id', async () => {
      // Arrange
      const id = 'invalid-id';
      prisma.colaborador.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne(id, organizationId)
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.findOne(id, organizationId)
      ).rejects.toThrow('Colaborador não encontrado');
    });

    it('should enforce organization isolation', async () => {
      // Arrange
      const id = 'colab-123';
      const differentOrgId = 'org-456';

      prisma.colaborador.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne(id, differentOrgId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAniversariantesProximos', () => {
    it('should return upcoming birthdays for current and next month', async () => {
      // Arrange
      const mockColaboradores = [
        { ...mockColaborador, endereco: mockEndereco, enviosBrinde: [] },
      ];

      prisma.colaborador.findMany.mockResolvedValue(mockColaboradores);

      // Act
      const result = await service.getAniversariantesProximos(organizationId);

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId,
            OR: expect.arrayContaining([
              expect.objectContaining({
                dataNascimento: expect.objectContaining({
                  gte: expect.any(Date),
                  lt: expect.any(Date),
                }),
              }),
            ]),
          }),
        })
      );
    });

    it('should limit results to 50', async () => {
      // Arrange
      prisma.colaborador.findMany.mockResolvedValue([]);

      // Act
      await service.getAniversariantesProximos(organizationId);

      // Assert
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should order by birthday', async () => {
      // Arrange
      prisma.colaborador.findMany.mockResolvedValue([]);

      // Act
      await service.getAniversariantesProximos(organizationId);

      // Assert
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            {
              dataNascimento: 'asc',
            },
          ],
        })
      );
    });
  });

  describe('update', () => {
    it('should update colaborador successfully', async () => {
      // Arrange
      const id = 'colab-123';
      const dto: UpdateColaboradorDto = updateColaboradorDto;

      const existingColaborador = {
        ...mockColaborador,
        endereco: mockEndereco,
      };

      const mockCepData = {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
      };

      cepService.consultarCep.mockResolvedValue(mockCepData);
      prisma.colaborador.findFirst.mockResolvedValue(existingColaborador);
      prisma.colaborador.update.mockResolvedValue({
        ...existingColaborador,
        cargo: dto.cargo,
        endereco: mockEndereco,
        enviosBrinde: [],
      });

      // Act
      const result = await service.update(id, dto, organizationId);

      // Assert
      expect(result).toHaveProperty('cargo', dto.cargo);
      expect(prisma.colaborador.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid id', async () => {
      // Arrange
      const id = 'invalid-id';
      const dto: UpdateColaboradorDto = updateColaboradorDto;

      prisma.colaborador.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(id, dto, organizationId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should update address if provided', async () => {
      // Arrange
      const id = 'colab-123';
      const dto: UpdateColaboradorDto = {
        cargo: 'Senior Developer',
        endereco: {
          cep: '01310100',
          numero: '999',
        },
      };

      const mockCepData = {
        cep: '01310100',
        logradouro: 'Nova Rua',
        bairro: 'Novo Bairro',
        cidade: 'São Paulo',
        uf: 'SP',
      };

      prisma.colaborador.findFirst.mockResolvedValue({
        ...mockColaborador,
        endereco: mockEndereco,
      });

      cepService.consultarCep.mockResolvedValue(mockCepData);

      prisma.colaborador.update.mockResolvedValue({
        ...mockColaborador,
        endereco: mockEndereco,
        enviosBrinde: [],
      });

      // Act
      await service.update(id, dto, organizationId);

      // Assert
      expect(cepService.consultarCep).toHaveBeenCalledWith(dto.endereco!.cep);
      expect(prisma.colaborador.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            endereco: expect.objectContaining({
              update: expect.any(Object),
            }),
          }),
        })
      );
    });

    it('should throw BadRequestException for invalid CEP on update', async () => {
      // Arrange
      const id = 'colab-123';
      const dto: UpdateColaboradorDto = {
        endereco: {
          cep: '00000000',
          numero: '123',
        },
      };

      prisma.colaborador.findFirst.mockResolvedValue({
        ...mockColaborador,
        endereco: mockEndereco,
      });

      cepService.consultarCep.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(id, dto, organizationId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove colaborador successfully', async () => {
      // Arrange
      const id = 'colab-123';

      prisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      prisma.colaborador.delete.mockResolvedValue(mockColaborador);

      // Act
      const result = await service.remove(id, organizationId);

      // Assert
      expect(result).toHaveProperty('message', 'Colaborador removido com sucesso');
      expect(prisma.colaborador.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw NotFoundException for invalid id', async () => {
      // Arrange
      const id = 'invalid-id';
      prisma.colaborador.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove(id, organizationId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should enforce organization isolation', async () => {
      // Arrange
      const id = 'colab-123';
      const differentOrgId = 'org-456';

      prisma.colaborador.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove(id, differentOrgId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEstatisticasDepartamentos', () => {
    it('should return statistics by department', async () => {
      // Arrange
      const mockDepartamentos = [
        { departamento: 'TI', _count: { departamento: 5 } },
        { departamento: 'RH', _count: { departamento: 3 } },
      ];

      prisma.colaborador.groupBy.mockResolvedValue(mockDepartamentos);
      prisma.envioBrinde.count.mockResolvedValue(2);

      // Act
      const result = await service.getEstatisticasDepartamentos(organizationId);

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('nome');
      expect(result[0]).toHaveProperty('totalColaboradores');
      expect(result[0]).toHaveProperty('enviosPendentes');
      expect(result[0]).toHaveProperty('enviosRealizados');
    });

    it('should filter by year if provided', async () => {
      // Arrange
      const ano = 2024;
      prisma.colaborador.groupBy.mockResolvedValue([
        { departamento: 'Tecnologia', _count: { departamento: 5 } },
      ]);
      prisma.envioBrinde.count.mockResolvedValue(2);

      // Act
      await service.getEstatisticasDepartamentos(organizationId, ano);

      // Assert
      expect(prisma.envioBrinde.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            anoAniversario: ano,
          }),
        })
      );
    });

    it('should use current year if year not provided', async () => {
      // Arrange
      const currentYear = new Date().getFullYear();
      prisma.colaborador.groupBy.mockResolvedValue([
        { departamento: 'Marketing', _count: { departamento: 3 } },
      ]);
      prisma.envioBrinde.count.mockResolvedValue(1);

      // Act
      await service.getEstatisticasDepartamentos(organizationId);

      // Assert
      expect(prisma.envioBrinde.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            anoAniversario: currentYear,
          }),
        })
      );
    });
  });

  describe('getAniversariosPorMes', () => {
    it('should return birthday statistics for all 12 months', async () => {
      // Arrange
      prisma.colaborador.count.mockResolvedValue(2);
      prisma.envioBrinde.count.mockResolvedValue(1);

      // Act
      const result = await service.getAniversariosPorMes(organizationId);

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(12);
      expect(result[0]).toHaveProperty('mes', 1);
      expect(result[0]).toHaveProperty('nomeDoMes', 'Janeiro');
      expect(result[0]).toHaveProperty('total');
      expect(result[0]).toHaveProperty('enviados');
      expect(result[0]).toHaveProperty('pendentes');
    });

    it('should filter by year if provided', async () => {
      // Arrange
      const ano = 2024;
      prisma.colaborador.count.mockResolvedValue(0);
      prisma.envioBrinde.count.mockResolvedValue(0);

      // Act
      await service.getAniversariosPorMes(organizationId, ano);

      // Assert
      expect(prisma.envioBrinde.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            anoAniversario: ano,
          }),
        })
      );
    });

    it('should count enviados and pendentes separately', async () => {
      // Arrange
      prisma.colaborador.count.mockResolvedValue(5);
      prisma.envioBrinde.count
        .mockResolvedValueOnce(3) // enviados
        .mockResolvedValueOnce(2); // pendentes

      // Act
      const result = await service.getAniversariosPorMes(organizationId);

      // Assert
      expect(result[0].enviados).toBe(3);
      expect(result[0].pendentes).toBe(2);
    });
  });

  describe('removeAll', () => {
    it('should remove all colaboradores for organization with cascade delete', async () => {
      // Arrange
      const deletedCount = 25;
      
      prisma.colaborador.deleteMany.mockResolvedValue({ count: deletedCount });

      // Act
      const result = await service.removeAll(organizationId);

      // Assert
      expect(result).toEqual({
        message: 'All colaboradores deleted successfully',
        deletedCount,
      });
      expect(prisma.colaborador.deleteMany).toHaveBeenCalledWith({
        where: {
          organizationId,
        },
      });
    });

    it('should return zero count when no colaboradores exist', async () => {
      // Arrange
      prisma.colaborador.deleteMany.mockResolvedValue({ count: 0 });

      // Act
      const result = await service.removeAll(organizationId);

      // Assert
      expect(result).toEqual({
        message: 'All colaboradores deleted successfully',
        deletedCount: 0,
      });
    });

    it('should enforce organization isolation in delete operation', async () => {
      // Arrange
      const differentOrgId = 'org-456';
      prisma.colaborador.deleteMany.mockResolvedValue({ count: 10 });

      // Act
      await service.removeAll(differentOrgId);

      // Assert
      expect(prisma.colaborador.deleteMany).toHaveBeenCalledWith({
        where: {
          organizationId: differentOrgId,
        },
      });
    });

    it('should cascade delete related envio brindes records', async () => {
      // Arrange
      // This test ensures that the Prisma cascade delete is working
      // The actual cascade is handled by the database/Prisma schema
      const deletedCount = 5;
      
      prisma.colaborador.deleteMany.mockResolvedValue({ count: deletedCount });

      // Act
      await service.removeAll(organizationId);

      // Assert
      // Verify that deleteMany was called with correct organization filter
      // Related records deletion is handled by database cascade
      expect(prisma.colaborador.deleteMany).toHaveBeenCalledWith({
        where: {
          organizationId,
        },
      });
    });
  });
});
