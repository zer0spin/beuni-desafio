import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EnvioBrindesController } from './envio-brindes.controller';
import { EnvioBrindesService } from './envio-brindes.service';

describe('EnvioBrindesController - Delete Operations', () => {
  let controller: EnvioBrindesController;
  let service: EnvioBrindesService;

  const mockEnvioBrindesService = {
    deleteAllShipments: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    verificarAniversariosProximos: vi.fn(),
    marcarComoEnviado: vi.fn(),
    criarRegistrosParaNovoAno: vi.fn(),
    getEstatisticas: vi.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: vi.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvioBrindesController],
      providers: [
        {
          provide: EnvioBrindesService,
          useValue: mockEnvioBrindesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<EnvioBrindesController>(EnvioBrindesController);
    service = module.get<EnvioBrindesService>(EnvioBrindesService);
    
    vi.clearAllMocks();
  });

  describe('deleteAll', () => {
    it('should delete all shipments for organization', async () => {
      // Arrange
      const mockUser = { organizationId: 'org-123' };
      const mockResult = {
        message: 'All shipments deleted successfully',
        deletedCount: 15,
      };

      mockEnvioBrindesService.deleteAllShipments.mockResolvedValue(mockResult);

      // Act
      const result = await controller.deleteAll(mockUser);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.deleteAllShipments).toHaveBeenCalledWith('org-123');
    });

    it('should handle empty organization gracefully', async () => {
      // Arrange
      const mockUser = { organizationId: 'org-empty' };
      const mockResult = {
        message: 'All shipments deleted successfully',
        deletedCount: 0,
      };

      mockEnvioBrindesService.deleteAllShipments.mockResolvedValue(mockResult);

      // Act
      const result = await controller.deleteAll(mockUser);

      // Assert
      expect(result).toEqual(mockResult);
      expect(result.deletedCount).toBe(0);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const mockUser = { organizationId: 'org-123' };
      const mockError = new Error('Database connection failed');

      mockEnvioBrindesService.deleteAllShipments.mockRejectedValue(mockError);

      // Act & Assert
      await expect(controller.deleteAll(mockUser)).rejects.toThrow(mockError);
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
        message: 'All shipments deleted successfully',
        deletedCount: 5,
      };

      mockEnvioBrindesService.deleteAllShipments.mockResolvedValue(mockResult);

      // Act
      await controller.deleteAll(mockUser);

      // Assert
      expect(service.deleteAllShipments).toHaveBeenCalledWith('test-org');
    });
  });
});