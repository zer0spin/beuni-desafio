import { ApiProperty } from '@nestjs/swagger';

class EnderecoResponseDto {
  @ApiProperty({
    example: 'Avenida Paulista',
    description: 'Logradouro do endereço',
  })
  logradouro: string;

  @ApiProperty({
    example: 'Bela Vista',
    description: 'Bairro do endereço',
  })
  bairro: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'Cidade do endereço',
  })
  cidade: string;

  @ApiProperty({
    example: 'SP',
    description: 'UF do endereço',
  })
  uf: string;
}

export class ColaboradorResponseDto {
  @ApiProperty({
    example: 'cm123abc456def789',
    description: 'ID único do colaborador',
  })
  id: string;

  @ApiProperty({
    example: 'João Carlos Silva',
    description: 'Nome completo do colaborador',
  })
  nome_completo: string;

  @ApiProperty({
    example: '25/10/1990',
    description: 'Data de nascimento formatada (dd/MM/yyyy)',
  })
  data_nascimento: string;

  @ApiProperty({
    example: 'Desenvolvedor Frontend',
    description: 'Cargo do colaborador',
  })
  cargo: string;

  @ApiProperty({
    example: 'Tecnologia',
    description: 'Departamento do colaborador',
  })
  departamento: string;

  @ApiProperty({
    description: 'Dados do endereço (sem informações sensíveis)',
    type: EnderecoResponseDto,
  })
  endereco: EnderecoResponseDto;

  @ApiProperty({
    example: 'PENDENTE',
    description: 'Status do envio de brinde do ano atual',
    enum: ['PENDENTE', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'],
  })
  status_envio_atual?: string;
}