import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    // CRITICAL FIX: Get JWT_SECRET before calling super()
    // Use process.env FIRST as it's always available, ConfigService may not be ready yet
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('❌ CRITICAL ERROR: JWT_SECRET not found in environment!');
      console.error('📋 Available env keys containing JWT:',
        Object.keys(process.env).filter(k => k.toLowerCase().includes('jwt'))
      );
      throw new Error('JWT_SECRET environment variable is required but not set');
    }

    console.log('✅ JwtStrategy: JWT_SECRET loaded successfully from process.env');
    console.log('🔒 JWT_SECRET length:', jwtSecret.length, 'characters');

    super({
      // Support both httpOnly cookie and Authorization header
      jwtFromRequest: (req: any) => {
        let token = null;

        // 1. Try to get from httpOnly cookie first (most secure)
        if (req?.cookies?.['beuni_token']) {
          token = req.cookies['beuni_token'];
          console.log('🍪 Token extracted from cookie');
        }
        // 2. Fallback to Authorization header
        else if (req?.headers?.authorization) {
          const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          if (bearerToken) {
            token = bearerToken;
            console.log('🔑 Token extracted from Authorization header');
          }
        }

        if (!token) {
          console.warn('⚠️ No token found in request (cookie or header)');
        }

        return token;
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      console.log('🔍 JwtStrategy.validate() - Payload recebido:', {
        sub: payload.sub,
        email: payload.email,
        organizacaoId: payload.organizacaoId,
        iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'N/A',
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
      });

      const user = await this.authService.validateJwtUser(payload);

      if (!user) {
        console.error('❌ JwtStrategy.validate() - Usuário não encontrado para payload:', payload.sub);
        throw new UnauthorizedException('Usuário não encontrado');
      }

      console.log('✅ JwtStrategy.validate() - Usuário validado:', {
        id: user.id,
        email: user.email,
        nome: user.nome,
      });

      return user;
    } catch (error) {
      console.error('❌ JwtStrategy.validate() - Erro:', error.message);
      throw new UnauthorizedException('Token inválido');
    }
  }
}