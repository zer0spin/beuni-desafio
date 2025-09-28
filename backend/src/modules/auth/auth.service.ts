import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../shared/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    organizationId: string;
    organizacao: {
      id: string;
      nome: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        organizacao: {
          select: { id: true, nome: true },
        },
      },
    });

    if (user && (await bcrypt.compare(password, user.senhaHash))) {
      const { senhaHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        organizationId: user.organizationId,
        organizacao: user.organizacao,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Usuário com este e-mail já existe');
    }

    // Hash password
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Create organization and user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create organization
      const organizacao = await tx.organizacao.create({
        data: {
          nome: registerDto.organizationName,
        },
      });

      // Create user
      const user = await tx.usuario.create({
        data: {
          nome: registerDto.name,
          email: registerDto.email,
          senhaHash,
          organizationId: organizacao.id,
        },
        include: {
          organizacao: {
            select: { id: true, nome: true },
          },
        },
      });

      return user;
    });

    const payload: JwtPayload = {
      sub: result.id,
      email: result.email,
      organizationId: result.organizationId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.id,
        nome: result.nome,
        email: result.email,
        organizationId: result.organizationId,
        organizacao: result.organizacao,
      },
    };
  }

  async validateJwtUser(payload: JwtPayload) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        organizacao: {
          select: { id: true, nome: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      organizationId: user.organizationId,
      organizacao: user.organizacao,
    };
  }
}