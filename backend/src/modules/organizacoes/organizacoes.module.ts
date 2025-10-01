import { Module } from '@nestjs/common';
import { OrganizacoesService } from './organizacoes.service';
import { OrganizacoesController } from './organizacoes.controller';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  controllers: [OrganizacoesController],
  providers: [OrganizacoesService, PrismaService],
  exports: [OrganizacoesService],
})
export class OrganizacoesModule {}