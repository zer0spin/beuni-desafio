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
    // CRITICAL: Use process.env directly - ConfigService may not be ready at startup
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('❌ FATAL: JWT_SECRET not found in environment variables!');
      throw new Error('JWT_SECRET environment variable is required');
    }

    super({
      // Support both httpOnly cookie and Authorization header
      jwtFromRequest: (req: any) => {
        // Prefer cookie when present
        const cookieToken = req?.cookies?.['beuni_token'];
        if (cookieToken && typeof cookieToken === 'string') {
          return cookieToken;
        }
        // Fallback to Authorization: Bearer <token>
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.authService.validateJwtUser(payload);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
