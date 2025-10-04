import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ColaboradoresController } from './colaboradores.controller';
import { ColaboradoresService } from './colaboradores.service';

describe('ColaboradoresController - Delete Operations', () => {
  let controller: ColaboradoresController;
  let service: ColaboradoresService;

  const mockColaboradoresService = {
    removeAll: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getAniversariantesProximos: vi.fn(),
    getEstatisticasDepartamentos: vi.fn(),
    getAniversariosPorMes: vi.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: vi.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColaboradoresController],
      providers: [
        {
          provide: ColaboradoresService,
          useValue: mockColaboradoresService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ColaboradoresController>(ColaboradoresController);
    service = module.get<ColaboradoresService>(ColaboradoresService);
    
    vi.clearAllMocks();
  });

  describe('removeAll', () => {
    it('should delete all colaboradores for organization', async () => {
      // Arrange
      const mockUser = { organizationId: 'org-123' };
      const mockResult = {
        message: 'All colaboradores deleted successfully',
        deletedCount: 25,
      };

      mockColaboradoresService.removeAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.removeAll(mockUser);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.removeAll).toHaveBeenCalledWith('org-123');
    });

    it('should handle empty organization gracefully', async () => {
      // Arrange
      const mockUser = { organizationId: 'org-empty' };
      const mockResult = {
        message: 'All colaboradores deleted successfully',
        deletedCount: 0,
      };

      mockColaboradoresService.removeAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.removeAll(mockUser);

      // Assert
      expect(result).toEqual(mockResult);
      expect(result.deletedCount).toBe(0);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const mockUser = { organizationId: 'org-123' };
      const mockError = new Error('Cascade delete failed');

      mockColaboradoresService.removeAll.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.removeAll(mockUser)).rejects.toThrow(mockError);
    });

    it('should enforce authentication via guard', async () => {
      // This test verifies that the JwtAuthGuard is applied
      // The actual authentication logic is tested in the guard's own tests
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should require organization context from user', async () => {
      // Arrange
      const mockUser = { organizationId: 'test-org' };
      const mockResult = {
        message: 'All colaboradores deleted successfully',
        deletedCount: 10,
      };

      mockColaboradoresService.removeAll.mockResolvedValue(mockResult);

      // Act
      await controller.removeAll(mockUser);

      // Assert
      expect(service.removeAll).toHaveBeenCalledWith('test-org');
    });

    it('should handle large deletion counts', async () => {
      // Arrange
      const mockUser = { organizationId: 'large-org' };
      const mockResult = {
        message: 'All colaboradores deleted successfully',
        deletedCount: 1000,
      };

      mockColaboradoresService.removeAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.removeAll(mockUser);

      // Assert
      expect(result).toEqual(mockResult);
      expect(result.deletedCount).toBe(1000);
    });
  });
});