import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../../shared/prisma.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: any;

  const mockOrganizacao = {
    id: 'org-123',
    nome: 'Test Organization',
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    nome: 'Test User',
    organizationId: 'org-123',
    organizacao: mockOrganizacao,
    senhaHash: '$2a$12$hashedpassword',
    imagemPerfil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      usuario: {
        findUnique: vi.fn(),
      },
    };

    service = new UsuariosService(prisma as any);
  });

  describe('findByEmail', () => {
    it('should return user by email with organization', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(result.organizacao).toEqual(mockOrganizacao);
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          organizacao: {
            select: { id: true, nome: true },
          },
        },
      });
    });

    it('should return null for non-existent email', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      prisma.usuario.findUnique.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.findByEmail('test@example.com')
      ).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return user by id with organization', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findById('user-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(result.organizacao).toEqual(mockOrganizacao);
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          organizacao: {
            select: { id: true, nome: true },
          },
        },
      });
    });

    it('should return null for non-existent id', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findById('invalid-id');

      // Assert
      expect(result).toBeNull();
    });

    it('should include user profile image if present', async () => {
      // Arrange
      const userWithImage = {
        ...mockUser,
        imagemPerfil: 'profile.jpg',
      };
      prisma.usuario.findUnique.mockResolvedValue(userWithImage);

      // Act
      const result = await service.findById('user-123');

      // Assert
      expect(result.imagemPerfil).toBe('profile.jpg');
    });
  });
});
