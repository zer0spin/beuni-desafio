import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create example organization
  console.log('🏢 Creating example organization...');
  const organizacao = await prisma.organizacao.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      id: 'demo-org-id',
      nome: 'Beuni Demo Company',
    },
  });

  // 2. Create example user (Ana, the HR Manager)
  console.log('👤 Creating example user...');
  const senhaHash = await bcrypt.hash('123456', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'ana.rh@beunidemo.com' },
    update: {},
    create: {
      nome: 'Ana Silva',
      email: 'ana.rh@beunidemo.com',
      senhaHash,
      organizationId: organizacao.id,
    },
  });

  // 3. Create example addresses
  console.log('🏠 Creating example addresses...');
  const enderecos = await Promise.all([
    prisma.endereco.create({
      data: {
        cep: '01310100',
        logradouro: 'Avenida Paulista',
        numero: '1578',
        complemento: 'Andar 12',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
      },
    }),
    prisma.endereco.create({
      data: {
        cep: '22071900',
        logradouro: 'Avenida Atlântica',
        numero: '2000',
        bairro: 'Copacabana',
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
      },
    }),
    prisma.endereco.create({
      data: {
        cep: '30112000',
        logradouro: 'Avenida Afonso Pena',
        numero: '1500',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        uf: 'MG',
      },
    }),
    prisma.endereco.create({
      data: {
        cep: '80020320',
        logradouro: 'Rua das Flores',
        numero: '456',
        complemento: 'Casa 2',
        bairro: 'Centro',
        cidade: 'Curitiba',
        uf: 'PR',
      },
    }),
    prisma.endereco.create({
      data: {
        cep: '90040191',
        logradouro: 'Rua dos Andradas',
        numero: '1001',
        bairro: 'Centro Histórico',
        cidade: 'Porto Alegre',
        uf: 'RS',
      },
    }),
  ]);

  // 4. Criar colaboradores com aniversários distribuídos ao longo do ano
  console.log('👥 Criando colaboradores de exemplo...');

  const colaboradores = [
    {
      nomeCompleto: 'João Carlos Silva',
      dataNascimento: new Date('1990-01-15'),
      cargo: 'Desenvolvedor Frontend',
      departamento: 'Tecnologia',
      addressId: enderecos[0].id,
    },
    {
      nomeCompleto: 'Maria Fernanda Santos',
      dataNascimento: new Date('1985-03-22'),
      cargo: 'Designer UX/UI',
      departamento: 'Design',
      addressId: enderecos[1].id,
    },
    {
      nomeCompleto: 'Pedro Oliveira Costa',
      dataNascimento: new Date('1992-06-10'),
      cargo: 'Analista de Marketing',
      departamento: 'Marketing',
      addressId: enderecos[2].id,
    },
    {
      nomeCompleto: 'Carla Regina Almeida',
      dataNascimento: new Date('1988-09-05'),
      cargo: 'Gerente de Vendas',
      departamento: 'Comercial',
      addressId: enderecos[3].id,
    },
    {
      nomeCompleto: 'Rafael Henrique Lima',
      dataNascimento: new Date('1995-12-18'),
      cargo: 'Analista Financeiro',
      departamento: 'Financeiro',
      addressId: enderecos[4].id,
    },
  ];

  for (const colaboradorData of colaboradores) {
    await prisma.colaborador.create({
      data: {
        ...colaboradorData,
        organizationId: organizacao.id,
      },
    });
  }

  // 5. Criar alguns registros de envio de brinde para demonstração
  console.log('🎁 Criando registros de envio de brinde...');

  const colaboradoresCriados = await prisma.colaborador.findMany({
    where: { organizationId: organizacao.id },
  });

  // Criar envios para o ano atual (2024) e próximo (2025)
  const anoAtual = new Date().getFullYear();

  for (const colaborador of colaboradoresCriados) {
    // Envio do ano passado (já enviado)
    await prisma.envioBrinde.create({
      data: {
        colaboradorId: colaborador.id,
        anoAniversario: anoAtual - 1,
        status: 'ENVIADO',
        dataGatilhoEnvio: new Date(anoAtual - 1, colaborador.dataNascimento.getMonth(), colaborador.dataNascimento.getDate() - 7),
        dataEnvioRealizado: new Date(anoAtual - 1, colaborador.dataNascimento.getMonth(), colaborador.dataNascimento.getDate() - 3),
        observacoes: 'Enviado com sucesso no ano anterior',
      },
    });

    // Envio do ano atual (varia o status)
    const status = Math.random() > 0.5 ? 'PENDENTE' : 'PRONTO_PARA_ENVIO';
    await prisma.envioBrinde.create({
      data: {
        colaboradorId: colaborador.id,
        anoAniversario: anoAtual,
        status,
        dataGatilhoEnvio: status === 'PRONTO_PARA_ENVIO' ?
          new Date(anoAtual, colaborador.dataNascimento.getMonth(), colaborador.dataNascimento.getDate() - 7) :
          null,
      },
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📧 Login de exemplo: ana.rh@beunidemo.com / 123456`);
  console.log(`🏢 Organização: ${organizacao.nome}`);
  console.log(`👥 ${colaboradores.length} colaboradores criados`);
  console.log(`🎁 ${colaboradoresCriados.length * 2} registros de envio de brinde criados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });