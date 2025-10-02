import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Allow safe methods without CSRF
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method)) {
      return true;
    }

    const tokenFromHeader = request.headers['x-csrf-token'];
    const tokenFromCookie = request.cookies?.['csrf_token'];

    if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
      throw new ForbiddenException('CSRF token inválido ou ausente');
    }

    return true;
  }
}
