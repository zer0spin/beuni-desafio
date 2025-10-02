/**
 * Fixtures de dados de teste para colaboradores
 */

export const mockEndereco = {
  id: 'endereco-123',
  cep: '01310100',
  logradouro: 'Avenida Paulista',
  numero: '1000',
  complemento: 'Sala 100',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  uf: 'SP',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockColaborador = {
  id: 'colab-123',
  nomeCompleto: 'Maria Santos',
  dataNascimento: new Date('1990-06-15'),
  cargo: 'Desenvolvedora Sênior',
  departamento: 'Tecnologia',
  organizationId: 'org-123',
  addressId: 'endereco-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockColaboradorWithEndereco = {
  ...mockColaborador,
  endereco: mockEndereco,
  enviosBrinde: [],
};

export const mockColaboradorWithEnvioBrinde = {
  ...mockColaborador,
  endereco: mockEndereco,
  enviosBrinde: [
    {
      id: 'envio-123',
      colaboradorId: 'colab-123',
      anoAniversario: new Date().getFullYear(),
      status: 'PENDENTE',
      dataGatilhoEnvio: null,
      dataEnvioRealizado: null,
      observacoes: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
};

export const mockCreateColaboradorDto = {
  nome_completo: 'Maria Santos',
  data_nascimento: '1990-06-15',
  cargo: 'Desenvolvedora Sênior',
  departamento: 'Tecnologia',
  endereco: {
    cep: '01310100',
    numero: '1000',
    complemento: 'Sala 100',
  },
};

export const mockUpdateColaboradorDto = {
  nome_completo: 'Maria Santos Updated',
  cargo: 'Desenvolvedora Principal',
  departamento: 'Tecnologia',
  endereco: {
    cep: '01310100',
    numero: '2000',
    complemento: 'Sala 200',
  },
};

export const mockAniversarianteProximo = {
  ...mockColaborador,
  dataNascimento: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3),
  endereco: mockEndereco,
  enviosBrinde: [],
};

export const mockColaboradorList = [
  mockColaboradorWithEndereco,
  {
    ...mockColaboradorWithEndereco,
    id: 'colab-456',
    nomeCompleto: 'João Pedro',
    departamento: 'Marketing',
  },
  {
    ...mockColaboradorWithEndereco,
    id: 'colab-789',
    nomeCompleto: 'Ana Clara',
    departamento: 'Recursos Humanos',
  },
];

export const mockCepResponseDto = {
  cep: '01310100',
  logradouro: 'Avenida Paulista',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  uf: 'SP',
  fromCache: false,
};
