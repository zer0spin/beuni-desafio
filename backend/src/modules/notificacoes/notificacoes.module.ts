import { Module } from '@nestjs/common';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  controllers: [NotificacoesController],
  providers: [NotificacoesService, PrismaService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}