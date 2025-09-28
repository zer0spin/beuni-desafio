import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ListColaboradoresDto {
  @ApiProperty({
    example: 1,
    description: 'Mês para filtrar aniversariantes (1-12)',
    required: false,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Mês deve ser um número inteiro' })
  @Min(1, { message: 'Mês deve ser entre 1 e 12' })
  @Max(12, { message: 'Mês deve ser entre 1 e 12' })
  mes?: number;

  @ApiProperty({
    example: 'Tecnologia',
    description: 'Departamento para filtrar colaboradores',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Departamento deve ser uma string' })
  departamento?: string;

  @ApiProperty({
    example: 1,
    description: 'Página da consulta (para paginação)',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser maior que 0' })
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Quantidade de itens por página',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit deve ser um número inteiro' })
  @Min(1, { message: 'Limit deve ser maior que 0' })
  @Max(100, { message: 'Limit deve ser no máximo 100' })
  limit?: number = 10;
}