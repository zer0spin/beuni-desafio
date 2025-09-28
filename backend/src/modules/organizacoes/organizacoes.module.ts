import { Module } from '@nestjs/common';
import { OrganizacoesService } from './organizacoes.service';

@Module({
  providers: [OrganizacoesService],
  exports: [OrganizacoesService],
})
export class OrganizacoesModule {}