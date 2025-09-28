import { IsNotEmpty, IsString, IsDateString, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CreateEnderecoDto {
  @ApiProperty({
    example: '01310100',
    description: 'CEP do endereço (8 dígitos, sem formatação)',
    pattern: '^[0-9]{8}$',
  })
  @IsString({ message: 'CEP deve ser uma string' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  cep: string;

  @ApiProperty({
    example: '1578',
    description: 'Número do endereço',
  })
  @IsString({ message: 'Número deve ser uma string' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  numero: string;

  @ApiProperty({
    example: 'Andar 12, Sala 1205',
    description: 'Complemento do endereço (opcional)',
    required: false,
  })
  @IsString({ message: 'Complemento deve ser uma string' })
  complemento?: string;
}

export class CreateColaboradorDto {
  @ApiProperty({
    example: 'João Carlos Silva',
    description: 'Nome completo do colaborador',
  })
  @IsString({ message: 'Nome completo deve ser uma string' })
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  @MaxLength(100, { message: 'Nome completo deve ter no máximo 100 caracteres' })
  nome_completo: string;

  @ApiProperty({
    example: '1990-10-25',
    description: 'Data de nascimento no formato ISO 8601 (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'Data de nascimento deve estar no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  data_nascimento: string;

  @ApiProperty({
    example: 'Desenvolvedor Frontend',
    description: 'Cargo do colaborador',
  })
  @IsString({ message: 'Cargo deve ser uma string' })
  @IsNotEmpty({ message: 'Cargo é obrigatório' })
  @MaxLength(100, { message: 'Cargo deve ter no máximo 100 caracteres' })
  cargo: string;

  @ApiProperty({
    example: 'Tecnologia',
    description: 'Departamento do colaborador',
  })
  @IsString({ message: 'Departamento deve ser uma string' })
  @IsNotEmpty({ message: 'Departamento é obrigatório' })
  @MaxLength(100, { message: 'Departamento deve ter no máximo 100 caracteres' })
  departamento: string;

  @ApiProperty({
    description: 'Dados do endereço do colaborador',
    type: CreateEnderecoDto,
  })
  @ValidateNested()
  @Type(() => CreateEnderecoDto)
  endereco: CreateEnderecoDto;
}