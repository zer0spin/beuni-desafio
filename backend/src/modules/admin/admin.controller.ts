import { Controller, Post, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { exec } from 'child_process';

@Controller('admin')
export class AdminController {
  /**
   * Dispara o script de seed populacional dentro do container.
   * Protegido por header "x-admin-token" que deve coincidir com ADMIN_SEED_TOKEN nas variáveis.
   */
  @Post('run-seed')
  async runSeed(@Headers('x-admin-token') token?: string): Promise<{ status: string; output?: string }> {
    const expected = process.env.ADMIN_SEED_TOKEN;
    if (!expected) {
      throw new HttpException('ADMIN_SEED_TOKEN não configurado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!token || token !== expected) {
      throw new HttpException('Não autorizado', HttpStatus.UNAUTHORIZED);
    }

    return new Promise((resolve, reject) => {
      // Executa via ts-node para usar o script TypeScript já existente
      exec('node -e "require(\'ts-node/register\'); require(\'./prisma/seed-populated.ts\')"', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          reject(new HttpException(`Falha ao executar seed: ${stderr || error.message}`, HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
          resolve({ status: 'ok', output: stdout });
        }
      });
    });
  }
}
