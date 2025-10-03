import { describe, it, expect } from 'vitest';
import type {
  User,
  Colaborador,
  EnvioBrinde,
  LoginCredentials,
  CreateColaboradorData,
  EnvioStatus,
  CepData,
  EstatisticasEnvio,
  PaginatedResponse,
} from '../index';

describe('Type Definitions', () => {
  describe('User type', () => {
    it('should have correct structure for User interface', () => {
      const user: User = {
        id: 'user-123',
        nome: 'João Silva',
        email: 'joao@example.com',
        organizationId: 'org-456',
        organizacao: {
          id: 'org-456',
          nome: 'Empresa Teste',
        },
      };

      expect(user.id).toBe('user-123');
      expect(user.nome).toBe('João Silva');
      expect(user.email).toBe('joao@example.com');
      expect(user.organizationId).toBe('org-456');
      expect(user.organizacao.nome).toBe('Empresa Teste');
    });

    it('should allow optional fields in User interface', () => {
      const userWithOptionals: User = {
        id: 'user-123',
        nome: 'Maria Santos',
        email: 'maria@example.com',
        imagemPerfil: 'https://example.com/avatar.jpg',
        imageTimestamp: 1640995200000,
        organizationId: 'org-789',
        organizacao: {
          id: 'org-789',
          nome: 'Outra Empresa',
        },
      };

      expect(userWithOptionals.imagemPerfil).toBeDefined();
      expect(userWithOptionals.imageTimestamp).toBe(1640995200000);
    });
  });

  describe('LoginCredentials type', () => {
    it('should have correct structure for LoginCredentials interface', () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(credentials.email).toBe('test@example.com');
      expect(credentials.password).toBe('password123');
    });
  });

  describe('Colaborador type', () => {
    it('should have correct structure for Colaborador interface', () => {
      const colaborador: Colaborador = {
        id: 'col-123',
        nome_completo: 'Pedro Oliveira',
        data_nascimento: '15/03/1990',
        cargo: 'Desenvolvedor',
        departamento: 'TI',
        endereco: {
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
        },
      };

      expect(colaborador.nome_completo).toBe('Pedro Oliveira');
      expect(colaborador.endereco.cidade).toBe('São Paulo');
      expect(colaborador.endereco.uf).toBe('SP');
    });

    it('should allow optional status_envio_atual field', () => {
      const colaboradorComStatus: Colaborador = {
        id: 'col-456',
        nome_completo: 'Ana Costa',
        data_nascimento: '22/07/1985',
        cargo: 'Analista',
        departamento: 'RH',
        endereco: {
          logradouro: 'Av. Principal, 456',
          bairro: 'Jardim',
          cidade: 'Rio de Janeiro',
          uf: 'RJ',
        },
        status_envio_atual: 'PENDENTE',
      };

      expect(colaboradorComStatus.status_envio_atual).toBe('PENDENTE');
    });
  });

  describe('CreateColaboradorData type', () => {
    it('should have correct structure for creating colaborador', () => {
      const newColaborador: CreateColaboradorData = {
        nome_completo: 'Carlos Silva',
        data_nascimento: '1988-12-10', // YYYY-MM-DD format
        cargo: 'Gerente',
        departamento: 'Vendas',
        endereco: {
          cep: '01234-567',
          numero: '789',
          complemento: 'Apto 101',
        },
      };

      expect(newColaborador.data_nascimento).toBe('1988-12-10');
      expect(newColaborador.endereco.cep).toBe('01234-567');
      expect(newColaborador.endereco.complemento).toBe('Apto 101');
    });

    it('should allow optional complemento field', () => {
      const newColaboradorSemComplemento: CreateColaboradorData = {
        nome_completo: 'Lucia Ferreira',
        data_nascimento: '1992-05-20',
        cargo: 'Assistente',
        departamento: 'Administrativo',
        endereco: {
          cep: '12345-678',
          numero: '100',
        },
      };

      expect(newColaboradorSemComplemento.endereco.complemento).toBeUndefined();
    });
  });

  describe('EnvioStatus type', () => {
    it('should accept valid status values', () => {
      const validStatuses: EnvioStatus[] = [
        'PENDENTE',
        'PRONTO_PARA_ENVIO',
        'ENVIADO',
        'ENTREGUE',
        'CANCELADO',
      ];

      validStatuses.forEach(status => {
        expect(status).toBeDefined();
        expect(typeof status).toBe('string');
      });
    });
  });

  describe('CepData type', () => {
    it('should have correct structure for CEP data', () => {
      const cepData: CepData = {
        cep: '01234-567',
        logradouro: 'Rua Example',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        fromCache: false,
      };

      expect(cepData.cep).toBe('01234-567');
      expect(cepData.fromCache).toBe(false);
    });
  });

  describe('EstatisticasEnvio type', () => {
    it('should have correct structure for statistics', () => {
      const stats: EstatisticasEnvio = {
        ano: 2024,
        total: 150,
        porStatus: {
          PENDENTE: 20,
          PRONTO_PARA_ENVIO: 10,
          ENVIADO: 80,
          ENTREGUE: 35,
          CANCELADO: 5,
        },
      };

      expect(stats.ano).toBe(2024);
      expect(stats.total).toBe(150);
      expect(stats.porStatus.ENVIADO).toBe(80);
    });
  });

  describe('PaginatedResponse type', () => {
    it('should have correct structure for paginated data', () => {
      const paginatedUsers: PaginatedResponse<User> = {
        data: [
          {
            id: 'user-1',
            nome: 'User 1',
            email: 'user1@example.com',
            organizationId: 'org-1',
            organizacao: { id: 'org-1', nome: 'Org 1' },
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      };

      expect(paginatedUsers.data).toHaveLength(1);
      expect(paginatedUsers.total).toBe(100);
      expect(paginatedUsers.totalPages).toBe(10);
    });
  });

  describe('EnvioBrinde type', () => {
    it('should have correct structure for envio brinde', () => {
      const envio: EnvioBrinde = {
        id: 'envio-123',
        anoAniversario: 2024,
        status: 'PRONTO_PARA_ENVIO',
        colaborador: {
          id: 'col-123',
          nome_completo: 'Test User',
          data_nascimento: '01/01/1990',
          cargo: 'Teste',
          departamento: 'QA',
          endereco: {
            logradouro: 'Rua Teste',
            bairro: 'Centro',
            cidade: 'Teste',
            uf: 'TS',
          },
        },
      };

      expect(envio.id).toBe('envio-123');
      expect(envio.anoAniversario).toBe(2024);
      expect(envio.status).toBe('PRONTO_PARA_ENVIO');
      expect(envio.colaborador.nome_completo).toBe('Test User');
    });

    it('should allow optional date fields', () => {
      const envioComDatas: EnvioBrinde = {
        id: 'envio-456',
        anoAniversario: 2024,
        status: 'ENVIADO',
        dataGatilhoEnvio: '2024-01-15T10:00:00Z',
        dataEnvioRealizado: '2024-01-16T14:30:00Z',
        observacoes: 'Entrega programada',
        colaborador: {
          id: 'col-456',
          nome_completo: 'Another User',
          data_nascimento: '15/06/1985',
          cargo: 'Manager',
          departamento: 'Admin',
          endereco: {
            logradouro: 'Av. Central',
            bairro: 'Comercial',
            cidade: 'Capital',
            uf: 'SP',
          },
        },
      };

      expect(envioComDatas.dataGatilhoEnvio).toBeDefined();
      expect(envioComDatas.dataEnvioRealizado).toBeDefined();
      expect(envioComDatas.observacoes).toBe('Entrega programada');
    });
  });

  describe('Type compatibility and validation', () => {
    it('should validate date format requirements', () => {
      // Colaborador uses dd/MM/yyyy
      const colaborador: Colaborador = {
        id: 'col-1',
        nome_completo: 'Test',
        data_nascimento: '15/03/1990', // dd/MM/yyyy
        cargo: 'Test',
        departamento: 'Test',
        endereco: {
          logradouro: 'Test',
          bairro: 'Test',
          cidade: 'Test',
          uf: 'TS',
        },
      };

      // CreateColaboradorData uses YYYY-MM-DD
      const createData: CreateColaboradorData = {
        nome_completo: 'Test',
        data_nascimento: '1990-03-15', // YYYY-MM-DD
        cargo: 'Test',
        departamento: 'Test',
        endereco: {
          cep: '12345-678',
          numero: '123',
        },
      };

      expect(colaborador.data_nascimento).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(createData.data_nascimento).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should ensure enum consistency for EnvioStatus', () => {
      const allStatuses: EnvioStatus[] = [
        'PENDENTE',
        'PRONTO_PARA_ENVIO',
        'ENVIADO',
        'ENTREGUE',
        'CANCELADO',
      ];

      const stats: EstatisticasEnvio = {
        ano: 2024,
        total: 100,
        porStatus: {
          PENDENTE: 10,
          PRONTO_PARA_ENVIO: 20,
          ENVIADO: 30,
          ENTREGUE: 25,
          CANCELADO: 15,
        },
      };

      // All enum values should be present in porStatus
      allStatuses.forEach(status => {
        expect(stats.porStatus[status]).toBeDefined();
        expect(typeof stats.porStatus[status]).toBe('number');
      });
    });
  });
});