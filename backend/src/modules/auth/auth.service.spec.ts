import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { PrismaService } from '../../shared/prisma.service';
import { mockPrismaService } from '../../../test/mocks/prisma.mock';
import { mockJwtService } from '../../../test/mocks/jwt.mock';
import { mockUser, mockOrganization } from '../../../test/fixtures/user.fixture';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;
  let jwt: typeof mockJwtService;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password for valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const userWithPassword = {
        ...mockUser,
        email,
        senhaHash: hashedPassword,
        organizacao: mockOrganization,
      };

      prisma.usuario.findUnique.mockResolvedValue(userWithPassword);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.senhaHash).toBeUndefined();
      expect(result.organizacao).toEqual(mockOrganization);
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          organizacao: {
            select: { id: true, nome: true },
          },
        },
      });
    });

    it('should return null for invalid email', async () => {
      // Arrange
      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('invalid@example.com', 'password');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('correctPassword', 12);
      const userWithPassword = {
        ...mockUser,
        senhaHash: hashedPassword,
      };

      prisma.usuario.findUnique.mockResolvedValue(userWithPassword);

      // Act
      const result = await service.validateUser('test@example.com', 'wrongPassword');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      prisma.usuario.findUnique.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        service.validateUser('test@example.com', 'password')
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('login', () => {
    it('should return JWT token and user data for valid credentials', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const validatedUser = {
        ...mockUser,
        organizacao: mockOrganization,
      };

      vi.spyOn(service, 'validateUser').mockResolvedValue(validatedUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user.organizacao).toEqual(mockOrganization);
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: validatedUser.id,
        email: validatedUser.email,
        organizationId: validatedUser.organizationId,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrong'
      };
      vi.spyOn(service, 'validateUser').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });

    it('should include user profile image if present', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const validatedUser = {
        ...mockUser,
        imagemPerfil: 'profile-pic.jpg',
        organizacao: mockOrganization,
      };

      vi.spyOn(service, 'validateUser').mockResolvedValue(validatedUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.user.imagemPerfil).toBe('profile-pic.jpg');
    });
  });

  describe('register', () => {
    it('should create user and organization in transaction', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
      };

      prisma.usuario.findUnique.mockResolvedValue(null);

      const createdOrganization = { ...mockOrganization };
      const createdUser = {
        ...mockUser,
        nome: registerDto.name,
        email: registerDto.email,
        organizacao: createdOrganization,
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          organizacao: {
            create: vi.fn().mockResolvedValue(createdOrganization),
          },
          usuario: {
            create: vi.fn().mockResolvedValue(createdUser),
          },
        });
      });

      jwt.sign.mockReturnValue('new-user-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('access_token', 'new-user-token');
      expect(result.user.nome).toBe(registerDto.name);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.organizacao).toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should hash password with bcrypt before saving', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'PlainPassword123!',
      };

      prisma.usuario.findUnique.mockResolvedValue(null);

      const bcryptHashSpy = vi.spyOn(bcrypt, 'hash');

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          organizacao: { create: vi.fn().mockResolvedValue(mockOrganization) },
          usuario: { create: vi.fn().mockResolvedValue(mockUser) },
        });
      });

      jwt.sign.mockReturnValue('token');

      // Act
      await service.register(registerDto);

      // Assert
      expect(bcryptHashSpy).toHaveBeenCalledWith(registerDto.password, 12);
    });

    it('should throw ConflictException for duplicate email', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Usuário com este e-mail já existe');
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
      };

      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow('Transaction failed');
    });

    it('should generate valid JWT payload', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
      };

      prisma.usuario.findUnique.mockResolvedValue(null);

      const createdUser = {
        id: 'user-new-123',
        email: registerDto.email,
        organizationId: 'org-new-123',
        nome: registerDto.name,
        organizacao: mockOrganization,
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          organizacao: { create: vi.fn().mockResolvedValue(mockOrganization) },
          usuario: { create: vi.fn().mockResolvedValue(createdUser) },
        });
      });

      jwt.sign.mockReturnValue('token');

      // Act
      await service.register(registerDto);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
        organizationId: createdUser.organizationId,
      });
    });
  });

  describe('validateJwtUser', () => {
    it('should return user data for valid JWT payload', async () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      };

      const userWithOrg = {
        ...mockUser,
        id: payload.sub,
        email: payload.email,
        organizacao: mockOrganization,
      };

      prisma.usuario.findUnique.mockResolvedValue(userWithOrg);

      // Act
      const result = await service.validateJwtUser(payload);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(payload.sub);
      expect(result.email).toBe(payload.email);
      expect(result.organizacao).toEqual(mockOrganization);
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: payload.sub },
        include: {
          organizacao: {
            select: { id: true, nome: true },
          },
        },
      });
    });

    it('should throw UnauthorizedException for invalid user ID', async () => {
      // Arrange
      const payload = {
        sub: 'invalid-user-id',
        email: 'test@example.com',
        organizationId: 'org-123',
      };

      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateJwtUser(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.validateJwtUser(payload)).rejects.toThrow('Usuário não encontrado');
    });

    it('should include user profile image in response', async () => {
      // Arrange
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
      };

      const userWithOrg = {
        ...mockUser,
        imagemPerfil: 'avatar.jpg',
        organizacao: mockOrganization,
      };

      prisma.usuario.findUnique.mockResolvedValue(userWithOrg);

      // Act
      const result = await service.validateJwtUser(payload);

      // Assert
      expect(result.imagemPerfil).toBe('avatar.jpg');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData: UpdateProfileDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const existingUser = {
        ...mockUser,
        id: userId,
        organizacao: mockOrganization,
      };

      const updatedUser = {
        ...existingUser,
        nome: updateData.name,
        email: updateData.email,
      };

      prisma.usuario.findUnique.mockResolvedValue(existingUser);
      prisma.usuario.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateProfile(userId, updateData);

      // Assert
      expect(result.user.nome).toBe(updateData.name);
      expect(result.user.email).toBe(updateData.email);
      expect(result.message).toBe('Perfil atualizado com sucesso');
    });

    it('should update organization name if provided', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData: UpdateProfileDto = {
        name: 'Updated Name',
        organizationName: 'New Org Name',
      };

      const existingUser = {
        ...mockUser,
        id: userId,
        organizacao: mockOrganization,
      };

      prisma.usuario.findUnique.mockResolvedValue(existingUser);
      prisma.organizacao.update.mockResolvedValue({
        ...mockOrganization,
        nome: updateData.organizationName,
      });
      prisma.usuario.update.mockResolvedValue(existingUser);

      // Act
      await service.updateProfile(userId, updateData);

      // Assert
      expect(prisma.organizacao.update).toHaveBeenCalledWith({
        where: { id: existingUser.organizationId },
        data: { nome: updateData.organizationName },
      });
    });

    it('should throw NotFoundException for invalid user', async () => {
      // Arrange
      const userId = 'invalid-user-id';
      const updateData: UpdateProfileDto = { name: 'Updated Name' };

      prisma.usuario.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProfile(userId, updateData)).rejects.toThrow(NotFoundException);
    });

    it('should handle image profile updates', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData: UpdateProfileDto = {
        imagemPerfil: 'profile-image-uuid.jpg',
      };

      const existingUser = {
        ...mockUser,
        id: userId,
        organizacao: mockOrganization,
      };

      const updatedUser = {
        ...existingUser,
        imagemPerfil: updateData.imagemPerfil,
      };

      prisma.usuario.findUnique.mockResolvedValue(existingUser);
      prisma.usuario.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateProfile(userId, updateData);

      // Assert
      expect(result.user.imagemPerfil).toBe(updateData.imagemPerfil);
      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            imagemPerfil: updateData.imagemPerfil,
          }),
        })
      );
    });

    it('should not update organization if name is the same', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData: UpdateProfileDto = {
        organizationName: mockOrganization.nome, // Same name
      };

      const existingUser = {
        ...mockUser,
        id: userId,
        organizacao: mockOrganization,
      };

      prisma.usuario.findUnique.mockResolvedValue(existingUser);
      prisma.usuario.update.mockResolvedValue(existingUser);

      // Act
      await service.updateProfile(userId, updateData);

      // Assert
      expect(prisma.organizacao.update).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData: UpdateProfileDto = {
        name: 'Only Name Updated',
      };

      const existingUser = {
        ...mockUser,
        id: userId,
        organizacao: mockOrganization,
      };

      const updatedUser = {
        ...existingUser,
        nome: updateData.name,
      };

      prisma.usuario.findUnique.mockResolvedValue(existingUser);
      prisma.usuario.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateProfile(userId, updateData);

      // Assert
      expect(result.user.nome).toBe(updateData.name);
      expect(result.user.email).toBe(existingUser.email); // Unchanged
    });
  });
});
