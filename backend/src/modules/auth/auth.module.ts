import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UploadService } from '../../shared/services/upload.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          console.error('❌ CRITICAL: JWT_SECRET não encontrado pelo JwtModule.registerAsync!');
          throw new Error('JWT_SECRET must be configured for JwtModule');
        }
        console.log('✅ JwtModule.registerAsync carregou o JWT_SECRET com sucesso.');
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
          },
        };
      },
    }),
    UsuariosModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    UploadService,
    {
      provide: JwtStrategy,
      inject: [AuthService, ConfigService],
      useFactory: (authService: AuthService, configService: ConfigService) => {
        console.log('🏭 Factory do JwtStrategy: Verificando JWT_SECRET...');
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          console.error('❌ CRITICAL: JWT_SECRET não disponível na factory do JwtStrategy!');
          throw new Error('JWT_SECRET is not available for JwtStrategy factory');
        }
        console.log('✅ Factory do JwtStrategy: JWT_SECRET encontrado. Criando JwtStrategy...');
        return new JwtStrategy(authService, configService);
      },
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}