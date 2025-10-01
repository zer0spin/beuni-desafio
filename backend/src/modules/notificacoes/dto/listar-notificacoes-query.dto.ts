import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TipoNotificacao } from './notificacao-response.dto';

export class ListarNotificacoesQueryDto {
  @IsOptional()
  @IsEnum(TipoNotificacao)
  tipo?: TipoNotificacao;

  @IsOptional()
  @IsString()
  filtro?: 'todos' | 'nao-lidas';

  @IsOptional()
  @IsString()
  busca?: string;
}