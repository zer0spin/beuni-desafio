import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Module({
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}