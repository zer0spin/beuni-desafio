import { ApiProperty } from '@nestjs/swagger';

export class CepResponseDto {
  @ApiProperty({
    example: '01310100',
    description: 'CEP consultado',
  })
  cep: string;

  @ApiProperty({
    example: 'Avenida Paulista',
    description: 'Logradouro/rua',
  })
  logradouro: string;

  @ApiProperty({
    example: 'Bela Vista',
    description: 'Bairro',
  })
  bairro: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'Cidade',
  })
  cidade: string;

  @ApiProperty({
    example: 'SP',
    description: 'Estado (UF)',
  })
  uf: string;

  @ApiProperty({
    example: false,
    description: 'Indica se o resultado veio do cache',
  })
  fromCache: boolean;
}