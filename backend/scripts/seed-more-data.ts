import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista de nomes brasileiros
const nomes = [
  'Rafael', 'Fernanda', 'Lucas', 'Juliana', 'Thiago', 'Camila',
  'Felipe', 'Amanda', 'Rodrigo', 'Beatriz', 'Bruno', 'Larissa',
  'Guilherme', 'Patrícia', 'Marcelo', 'Renata', 'André', 'Carolina',
  'Diego', 'Vanessa', 'Eduardo', 'Daniela', 'Gabriel', 'Aline',
  'Leonardo', 'Bianca', 'Pedro', 'Isabela', 'Vinícius', 'Jéssica'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
  'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro',
  'Martins', 'Carvalho', 'Rocha', 'Almeida', 'Nascimento', 'Araújo',
  'Melo', 'Barbosa', 'Cardoso', 'Cavalcanti', 'Monteiro', 'Mendes'
];

const cargos = [
  'Desenvolvedor(a) Full Stack', 'Analista de Dados', 'Gerente de Projetos',
  'Designer UX/UI', 'Engenheiro(a) de Software', 'Product Owner',
  'Scrum Master', 'Desenvolvedor(a) Frontend', 'Desenvolvedor(a) Backend',
  'DevOps Engineer', 'QA Analyst', 'Business Analyst', 'Tech Lead',
  'Coordenador(a) de TI', 'Arquiteto(a) de Software', 'Data Scientist'
];

const departamentos = [
  'Tecnologia', 'Produto', 'Engenharia', 'Design', 'Qualidade',
  'DevOps', 'Dados', 'Inovação', 'Desenvolvimento', 'Infraestrutura'
];

const cidades = [
  { cidade: 'São Paulo', uf: 'SP', cep: '01000-000' },
  { cidade: 'Rio de Janeiro', uf: 'RJ', cep: '20000-000' },
  { cidade: 'Belo Horizonte', uf: 'MG', cep: '30000-000' },
  { cidade: 'Curitiba', uf: 'PR', cep: '80000-000' },
  { cidade: 'Porto Alegre', uf: 'RS', cep: '90000-000' },
  { cidade: 'Brasília', uf: 'DF', cep: '70000-000' },
  { cidade: 'Salvador', uf: 'BA', cep: '40000-000' },
  { cidade: 'Fortaleza', uf: 'CE', cep: '60000-000' },
  { cidade: 'Recife', uf: 'PE', cep: '50000-000' },
  { cidade: 'Florianópolis', uf: 'SC', cep: '88000-000' }
];

const statusPossiveis = ['PENDENTE', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Gerar data de nascimento em um mês específico de diferentes anos
function generateBirthDate(mes: number, anoInicio: number = 1980, anoFim: number = 2000): Date {
  const ano = anoInicio + Math.floor(Math.random() * (anoFim - anoInicio + 1));
  const dia = 1 + Math.floor(Math.random() * 28); // Evitar problemas com fevereiro
  return new Date(ano, mes - 1, dia);
}

async function main() {
  console.log('🌱 Iniciando seed de dados diversificados...\n');

  // Buscar organização demo
  let organizacao = await prisma.organizacao.findFirst({
    where: { nome: { contains: 'demo' } }
  });

  if (!organizacao) {
    console.log('📦 Criando organização demo...');
    organizacao = await prisma.organizacao.create({
      data: { nome: 'Beuni Demo Organization' }
    });
  }

  console.log(`✅ Usando organização: ${organizacao.nome} (${organizacao.id})\n`);

  const colaboradoresCriados = [];

  // Criar 30 colaboradores distribuídos em todos os meses
  for (let i = 0; i < 30; i++) {
    const mes = (i % 12) + 1; // Distribuir pelos 12 meses
    const nome = randomItem(nomes);
    const sobrenome = randomItem(sobrenomes);
    const nomeCompleto = `${nome} ${sobrenome}`;
    const endereco = randomItem(cidades);

    const colaborador = await prisma.colaborador.create({
      data: {
        nomeCompleto,
        dataNascimento: generateBirthDate(mes),
        cargo: randomItem(cargos),
        departamento: randomItem(departamentos),
        organizacao: {
          connect: { id: organizacao.id }
        },
        endereco: {
          create: {
            logradouro: `Rua ${randomItem(['das Flores', 'Principal', 'Central', 'dos Ipês', 'das Acácias'])}`,
            numero: String(100 + Math.floor(Math.random() * 900)),
            bairro: randomItem(['Centro', 'Jardim', 'Vila Nova', 'Parque', 'Residencial']),
            cidade: endereco.cidade,
            uf: endereco.uf,
            cep: endereco.cep,
          }
        },
      },
      include: {
        endereco: true
      }
    });

    colaboradoresCriados.push(colaborador);
    console.log(`✅ Criado: ${colaborador.nomeCompleto} - Aniversário em ${new Date(colaborador.dataNascimento).toLocaleDateString('pt-BR')}`);
  }

  console.log(`\n📊 Total de colaboradores criados: ${colaboradoresCriados.length}\n`);

  // Criar envios para múltiplos anos (2021, 2022, 2023, 2024, 2025)
  const anos = [2021, 2022, 2023, 2024, 2025];
  let totalEnvios = 0;

  for (const ano of anos) {
    console.log(`📅 Criando envios para o ano ${ano}...`);

    for (const colaborador of colaboradoresCriados) {
      // Determinar status baseado em probabilidades
      let status: string;
      const random = Math.random();

      // Anos passados têm mais envios concluídos
      if (ano < 2024) {
        if (random < 0.7) status = 'ENTREGUE';
        else if (random < 0.85) status = 'ENVIADO';
        else if (random < 0.95) status = 'CANCELADO';
        else status = 'PRONTO_PARA_ENVIO';
      } else if (ano === 2024) {
        if (random < 0.5) status = 'ENTREGUE';
        else if (random < 0.7) status = 'ENVIADO';
        else if (random < 0.85) status = 'PRONTO_PARA_ENVIO';
        else if (random < 0.95) status = 'PENDENTE';
        else status = 'CANCELADO';
      } else { // 2025
        if (random < 0.3) status = 'ENTREGUE';
        else if (random < 0.5) status = 'ENVIADO';
        else if (random < 0.7) status = 'PRONTO_PARA_ENVIO';
        else if (random < 0.9) status = 'PENDENTE';
        else status = 'CANCELADO';
      }

      // Calcular data de gatilho (30 dias antes do aniversário)
      const dataNasc = new Date(colaborador.dataNascimento);
      const dataGatilho = new Date(ano, dataNasc.getMonth(), dataNasc.getDate() - 30);

      // Data de envio real (se aplicável)
      let dataEnvio = null;
      if (['ENVIADO', 'ENTREGUE'].includes(status)) {
        dataEnvio = randomDate(dataGatilho, new Date(ano, dataNasc.getMonth(), dataNasc.getDate()));
      }

      await prisma.envioBrinde.upsert({
        where: {
          colaboradorId_anoAniversario: {
            colaboradorId: colaborador.id,
            anoAniversario: ano,
          },
        },
        update: {
          status: status as any,
          dataGatilhoEnvio: dataGatilho,
          dataEnvioRealizado: dataEnvio,
        },
        create: {
          colaboradorId: colaborador.id,
          anoAniversario: ano,
          status: status as any,
          dataGatilhoEnvio: dataGatilho,
          dataEnvioRealizado: dataEnvio,
        },
      });

      totalEnvios++;
    }

    console.log(`   ✅ ${colaboradoresCriados.length} envios criados para ${ano}`);
  }

  console.log(`\n🎉 Seed concluído com sucesso!`);
  console.log(`📊 Estatísticas finais:`);
  console.log(`   - Colaboradores: ${colaboradoresCriados.length}`);
  console.log(`   - Envios criados: ${totalEnvios}`);
  console.log(`   - Anos com dados: ${anos.join(', ')}`);
  console.log(`   - Distribuição: Todos os meses do ano`);
  console.log(`   - Status: Variados (PENDENTE, PRONTO, ENVIADO, ENTREGUE, CANCELADO)\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
