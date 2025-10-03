import { Controller, Post, Body, UseGuards, Get, Request, Patch, UseInterceptors, UploadedFile, BadRequestException, Param, Res, NotFoundException } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SkipCsrf } from '../../common/decorators/skip-csrf.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UploadService } from '../../shared/services/upload.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private uploadService: UploadService,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 60) // 5 attempts per minute
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            organizationId: { type: 'string' },
            organizacao: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                nome: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
  })
  @SkipCsrf()
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const authResponse = await this.authService.login(loginDto);

    // SECURITY: Set httpOnly cookie to prevent XSS attacks
    // Token is not accessible via JavaScript (document.cookie)
    response.cookie('beuni_token', authResponse.access_token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // CSRF: set non-httpOnly cookie with CSRF token that mirrors server-side token check
  const csrfToken = Math.random().toString(36).slice(2);
    response.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Return user data only (no token in response body)
    return { user: authResponse.user };
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Cadastro de novo usuário e organização' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário cadastrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            organizationId: { type: 'string' },
            organizacao: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                nome: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário com este e-mail já existe',
  })
  @SkipCsrf()
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const authResponse = await this.authService.register(registerDto);

    // SECURITY: Set httpOnly cookie to prevent XSS attacks
    response.cookie('beuni_token', authResponse.access_token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // CSRF: set token cookie
  const csrfToken = Math.random().toString(36).slice(2);
    response.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Return user data only (no token in response body)
    return { user: authResponse.user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Logout do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
  })
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear httpOnly cookie
    response.clearCookie('beuni_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    response.clearCookie('csrf_token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logout realizado com sucesso' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Dados atualizados com sucesso',
  })
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('upload-profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('jwt')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de imagem de perfil' })
  @ApiResponse({
    status: 200,
    description: 'Imagem uploaded com sucesso',
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' },
        user: { type: 'object' }
      }
    }
  })
  async uploadProfileImage(
    @Request() req,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem foi enviada');
    }

    const imageUrl = await this.uploadService.uploadProfileImage(file, req.user.id);

    // Atualizar o usuário com a nova URL da imagem
    const result = await this.authService.updateProfile(req.user.id, {
      imagemPerfil: imageUrl,
    });

    return {
      imageUrl,
      user: result.user,
      message: result.message,
    };
  }

  @Get('profile-image/:filename')
  @ApiOperation({ summary: 'Obter imagem de perfil' })
  @ApiParam({ name: 'filename', description: 'Nome do arquivo da imagem' })
  @ApiResponse({
    status: 200,
    description: 'Imagem retornada com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Imagem não encontrada',
  })
  async getProfileImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const imagePath = join(process.cwd(), 'uploads', 'profile-images', filename);

      // Verificar se o arquivo existe
      if (!existsSync(imagePath)) {
        // Retornar imagem padrão
        const defaultImagePath = join(process.cwd(), 'public', 'default-profile.png');

        if (existsSync(defaultImagePath)) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.sendFile(defaultImagePath);
        }

        // Fallback SVG inline caso nenhuma imagem exista
        const fallbackSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="24" fill="#FFA559"/>
  <circle cx="128" cy="108" r="52" fill="white" fill-opacity="0.85"/>
  <path d="M40 228c0-48 40-80 88-80s88 32 88 80" stroke="white" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(fallbackSvg);
      }

      // Determinar o tipo de conteúdo baseado na extensão
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = 'image/jpeg';

      switch (ext) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 1 dia

      return res.sendFile(imagePath);
    } catch (error) {
      // Log simples para rastrear falhas em produção sem vazar detalhes ao cliente
      console.warn('[AuthController] Falha ao servir imagem de perfil:', filename, error?.message);
      throw new NotFoundException('Imagem não encontrada');
    }
  }
}