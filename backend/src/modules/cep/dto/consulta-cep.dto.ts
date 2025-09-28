import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultaCepDto {
  @ApiProperty({
    example: '01310100',
    description: 'CEP para consulta (8 dígitos, sem formatação)',
    pattern: '^[0-9]{8}$',
  })
  @IsString({ message: 'CEP deve ser uma string' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @Matches(/^[0-9]{8}$/, { message: 'CEP deve conter exatamente 8 dígitos numéricos' })
  cep: string;
}