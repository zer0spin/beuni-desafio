import { Module } from '@nestjs/common';
import { ColaboradoresController } from './colaboradores.controller';
import { ColaboradoresService } from './colaboradores.service';
import { CepModule } from '../cep/cep.module';

@Module({
  imports: [CepModule],
  controllers: [ColaboradoresController],
  providers: [ColaboradoresService],
  exports: [ColaboradoresService],
})
export class ColaboradoresModule {}