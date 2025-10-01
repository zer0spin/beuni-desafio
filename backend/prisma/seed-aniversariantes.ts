/**
 * Script para popular banco com colaboradores que fazem aniversário nos próximos dias
 * Hoje: 01 de Novembro
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NOMES_MASCULINOS = [
  'André Silva', 'Bruno Costa', 'Carlos Souza', 'Daniel Lima', 'Eduardo Santos',
  'Felipe Oliveira', 'Gabriel Ferreira', 'Henrique Alves', 'Igor Rodrigues', 'João Pereira',
  'Kevin Martins', 'Leonardo Barbosa', 'Marcos Ribeiro', 'Nathan Cardoso', 'Otávio Mendes',
  'Paulo Araújo', 'Rafael Castro', 'Samuel Moreira', 'Thiago Rocha', 'Vitor Gomes',
  'Wagner Dias', 'Xavier Correia', 'Yuri Teixeira', 'Zacarias Pinto', 'Alexandre Monteiro'
];

const NOMES_FEMININOS = [
  'Ana Paula Costa', 'Beatriz Silva', 'Camila Santos', 'Daniela Oliveira', 'Eduarda Lima',
  'Fernanda Souza', 'Gabriela Ferreira', 'Helena Alves', 'Isabela Rodrigues', 'Julia Pereira',
  'Karen Martins', 'Larissa Barbosa', 'Marina Ribeiro', 'Natalia Cardoso', 'Olivia Mendes',
  'Patricia Araújo', 'Rafaela Castro', 'Sabrina Moreira', 'Tatiana Rocha', 'Vanessa Gomes',
  'Wanessa Dias', 'Yasmin Correia', 'Zoe Teixeira', 'Amanda Pinto', 'Bruna Monteiro'
];

const CARGOS = [
  'Desenvolvedor Frontend',
  'Desenvolvedor Backend',
  'Desenvolvedor Fullstack',
  'Designer UX/UI',
  'Product Manager',
  'Scrum Master',
  'QA/Tester',
  'DevOps Engineer',
  'Data Analyst',
  'Business Analyst'
];

const DEPARTAMENTOS = [
  'Tecnologia',
  'Desenvolvimento',
  'Design',
  'Produto',
  'Qualidade',
  'Infraestrutura'
];

const CEPS_VALIDOS = [
  '30130100', // BH - Centro
  '01310100', // SP - Paulista
  '20040020', // RJ - Centro
  '40110160', // Salvador - Centro
  '80010030', // Curitiba - Centro
  '30140071', // BH - Funcionários
  '04543907', // SP - Vila Olímpia
  '22640100', // RJ - Barra
  '41820021', // Salvador - Pituba
  '80250030', // Curitiba - Batel
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Iniciando seed de aniversariantes...');

  // Buscar primeira organização
  const organizacao = await prisma.organizacao.findFirst();

  if (!organizacao) {
    console.error('❌ Nenhuma organização encontrada. Execute o seed principal primeiro.');
    return;
  }

  console.log(`📦 Usando organização: ${organizacao.nome} (${organizacao.id})`);

  const todosNomes = [...NOMES_MASCULINOS, ...NOMES_FEMININOS];
  const anoAtual = new Date().getFullYear();

  // Distribuir aniversários: hoje (01/11) e próximos 5 dias (02-06/11)
  const distribuicao = [
    { dia: 1, quantidade: 15 },  // Hoje - 15 aniversariantes
    { dia: 2, quantidade: 12 },  // Amanhã - 12 aniversariantes
    { dia: 3, quantidade: 10 },  // 03/11 - 10 aniversariantes
    { dia: 4, quantidade: 8 },   // 04/11 - 8 aniversariantes
    { dia: 5, quantidade: 10 },  // 05/11 - 10 aniversariantes
    { dia: 6, quantidade: 5 },   // 06/11 - 5 aniversariantes
  ];

  let totalCriados = 0;
  let nomesUsados = new Set<string>();

  for (const { dia, quantidade } of distribuicao) {
    console.log(`\n📅 Criando ${quantidade} aniversariantes para 0${dia}/11...`);

    for (let i = 0; i < quantidade; i++) {
      // Garantir nome único
      let nome: string;
      do {
        nome = getRandomItem(todosNomes);
      } while (nomesUsados.has(nome));
      nomesUsados.add(nome);

      const anoNascimento = anoAtual - getRandomNumber(22, 55); // Idade entre 22 e 55 anos
      const dataNascimento = new Date(anoNascimento, 10, dia); // Mês 10 = Novembro

      try {
        // Criar endereço
        const cep = getRandomItem(CEPS_VALIDOS);
        const endereco = await prisma.endereco.create({
          data: {
            cep: cep,
            logradouro: `Rua Exemplo ${getRandomNumber(1, 100)}`,
            numero: String(getRandomNumber(1, 9999)),
            complemento: Math.random() > 0.5 ? `Apto ${getRandomNumber(101, 999)}` : null,
            bairro: 'Centro',
            cidade: 'São Paulo',
            uf: 'SP',
          },
        });

        // Criar colaborador
        const colaborador = await prisma.colaborador.create({
          data: {
            nomeCompleto: nome,
            dataNascimento: dataNascimento,
            cargo: getRandomItem(CARGOS),
            departamento: getRandomItem(DEPARTAMENTOS),
            organizationId: organizacao.id,
            addressId: endereco.id,
          },
        });

        // Criar registro de envio de brinde
        const statusOptions = ['PENDENTE', 'PRONTO_PARA_ENVIO', 'ENVIADO'];
        const status = dia === 1
          ? getRandomItem(['PRONTO_PARA_ENVIO', 'ENVIADO']) // Hoje: status mais avançados
          : 'PENDENTE'; // Próximos dias: pendente

        await prisma.envioBrinde.create({
          data: {
            colaboradorId: colaborador.id,
            anoAniversario: anoAtual,
            status: status as any,
            dataGatilhoEnvio: dia === 1 ? new Date() : null, // Só hoje tem gatilho
          },
        });

        totalCriados++;

        if ((i + 1) % 5 === 0) {
          process.stdout.write(`  ✓ ${i + 1}/${quantidade} criados...\r`);
        }
      } catch (error) {
        console.error(`\n❌ Erro ao criar colaborador ${nome}:`, error);
      }
    }

    console.log(`  ✅ ${quantidade} aniversariantes de 0${dia}/11 criados com sucesso!`);
  }

  console.log(`\n🎉 Seed concluído! Total de ${totalCriados} colaboradores criados.`);
  console.log('\n📊 Distribuição:');
  console.log('  • 01/11 (hoje): 15 aniversariantes');
  console.log('  • 02/11: 12 aniversariantes');
  console.log('  • 03/11: 10 aniversariantes');
  console.log('  • 04/11: 8 aniversariantes');
  console.log('  • 05/11: 10 aniversariantes');
  console.log('  • 06/11: 5 aniversariantes');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
