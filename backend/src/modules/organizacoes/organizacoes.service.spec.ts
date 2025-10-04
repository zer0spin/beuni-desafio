import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrganizacoesService } from './organizacoes.service';
import { PrismaService } from '../../shared/prisma.service';

describe('OrganizacoesService', () => {
  let service: OrganizacoesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      organizacao: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new OrganizacoesService(prisma as any);
  });

  describe('findById', () => {
    it('should return organizacao by id', async () => {
      // Arrange
      const mockOrg = {
        id: 'org-123',
        nome: 'Test Organization',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.organizacao.findUnique.mockResolvedValue(mockOrg);

      // Act
      const result = await service.findById('org-123');

      // Assert
      expect(result).toEqual(mockOrg);
      expect(prisma.organizacao.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
    });

    it('should return null for non-existent organization', async () => {
      // Arrange
      prisma.organizacao.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new organization', async () => {
      // Arrange
      const nome = 'New Organization';
      const mockCreated = {
        id: 'org-new',
        nome,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.organizacao.create.mockResolvedValue(mockCreated);

      // Act
      const result = await service.create(nome);

      // Assert
      expect(result).toEqual(mockCreated);
      expect(prisma.organizacao.create).toHaveBeenCalledWith({
        data: { nome },
      });
    });
  });

  describe('update', () => {
    it('should update organization name', async () => {
      // Arrange
      const updateDto = { name: 'Updated Name' };
      const mockUpdated = {
        id: 'org-123',
        nome: 'Updated Name',
      };

      prisma.organizacao.update.mockResolvedValue(mockUpdated);

      // Act
      const result = await service.update('org-123', updateDto);

      // Assert
      expect(result).toEqual(mockUpdated);
      expect(prisma.organizacao.update).toHaveBeenCalledWith({
        where: { id: 'org-123' },
        data: { nome: updateDto.name },
        select: {
          id: true,
          nome: true,
        },
      });
    });
  });
});
