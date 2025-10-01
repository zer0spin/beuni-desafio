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
        access_token: { type: 'string' },
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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
        access_token: { type: 'string' },
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
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
    const updatedUser = await this.authService.updateProfile(req.user.id, {
      imagemPerfil: imageUrl,
    });

    return {
      imageUrl,
      user: updatedUser,
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
        throw new NotFoundException('Imagem não encontrada');
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
      throw new NotFoundException('Imagem não encontrada');
    }
  }
}