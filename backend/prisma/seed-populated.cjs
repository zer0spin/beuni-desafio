// CommonJS version for Railway SSH execution
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helpers
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const firstNames = ['Ana','Bruno','Camila','Diego','Eduarda','Felipe','Gabriela','Henrique','Isabela','João','Karina','Lucas','Mariana','Nathan','Olívia','Paulo','Rafaela','Sabrina','Thiago','Valéria','William','Yasmin','Zoe','André','Bianca','Carlos','Daniela','Emanuel','Fabiana','Gustavo','Helena','Igor','Juliana','Kevin','Larissa','Marcelo','Natália','Otávio','Priscila','Quésia','Rodrigo','Samuel','Tatiana','Ulisses','Vinícius','Wendy','Xavier','Yuri','Zilda'];
const lastNames = ['Silva','Souza','Oliveira','Santos','Pereira','Lima','Carvalho','Ferreira','Rodrigues','Almeida','Gomes','Martins','Araújo','Melo','Barbosa','Dias','Teixeira','Castro','Moreira','Cardoso'];

const cargos = ['Dev Frontend','Dev Backend','Fullstack Dev','UX Designer','PM','QA','DevOps','Data Analyst','Business Analyst','Analista Financeiro','Assistente Administrativo','Coordenador de TI','Especialista em Cloud Computing','Coordenador de Operações'];
const departamentos = ['Tecnologia','Desenvolvimento','Design','Produto','Qualidade','Infraestrutura','Comercial','Financeiro','Marketing','Dados'];
const cidades = [
  {cep:'01310100', logradouro:'Avenida Paulista', cidade:'São Paulo', uf:'SP', bairro:'Bela Vista'},
  {cep:'22071900', logradouro:'Avenida Atlântica', cidade:'Rio de Janeiro', uf:'RJ', bairro:'Copacabana'},
  {cep:'30112000', logradouro:'Avenida Afonso Pena', cidade:'Belo Horizonte', uf:'MG', bairro:'Centro'},
  {cep:'80020320', logradouro:'Rua das Flores', cidade:'Curitiba', uf:'PR', bairro:'Centro'},
  {cep:'90040191', logradouro:'Rua dos Andradas', cidade:'Porto Alegre', uf:'RS', bairro:'Centro Histórico'},
  {cep:'50050400', logradouro:'Avenida Boa Viagem', cidade:'Recife', uf:'PE', bairro:'Boa Viagem'},
  {cep:'60160230', logradouro:'Avenida Beira Mar', cidade:'Fortaleza', uf:'CE', bairro:'Meireles'},
  {cep:'70040010', logradouro:'Esplanada dos Ministérios', cidade:'Brasília', uf:'DF', bairro:'Zona Cívico-Administrativa'},
  {cep:'69005040', logradouro:'Avenida Eduardo Ribeiro', cidade:'Manaus', uf:'AM', bairro:'Centro'}
];

function randomBirthDate() {
  const year = randInt(1970, 2003);
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  return new Date(year, month, day);
}

function buildFullName() {
  return `${rand(firstNames)} ${rand(lastNames)} ${rand(lastNames)}`;
}

async function main() {
  console.log('🌱 Seed populacional iniciado...');

  // Org + usuário padrão
  const org = await prisma.organizacao.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: { id: 'demo-org-id', nome: 'Beuni Demo Company' },
  });

  const senhaHash = await bcrypt.hash('AnaPass123@2025', 10);
  const user = await prisma.usuario.upsert({
    where: { email: 'ana.novo@beunidemo.com' },
    update: { senha: senhaHash },
    create: {
      email: 'ana.novo@beunidemo.com',
      nome: 'Ana Novo',
      senha: senhaHash,
      organizacaoId: org.id,
    },
  });

  console.log(`✅ Org "${org.nome}" + usuário "${user.email}"`);

  // 120 colaboradores
  const colaboradores = [];
  for (let i = 1; i <= 120; i++) {
    const nome = buildFullName();
    const loc = rand(cidades);
    const dataNascimento = randomBirthDate();

    colaboradores.push({
      nome,
      email: `${nome.toLowerCase().replace(/\s+/g,'.')}.${i}@beunidemo.com`,
      cargo: rand(cargos),
      departamento: rand(departamentos),
      dataNascimento,
      cep: loc.cep,
      logradouro: loc.logradouro,
      numero: randInt(1, 999).toString(),
      cidade: loc.cidade,
      uf: loc.uf,
      bairro: loc.bairro,
      organizacaoId: org.id,
    });
  }

  await prisma.colaborador.createMany({ data: colaboradores, skipDuplicates: true });
  console.log(`✅ ${colaboradores.length} colaboradores criados`);

  // Envios de brinde
  const allColabs = await prisma.colaborador.findMany({ where: { organizacaoId: org.id } });
  const envios = [];
  const qtdEnvios = Math.min(40, allColabs.length);

  for (let i = 0; i < qtdEnvios; i++) {
    const colab = rand(allColabs);
    const anoEnvio = rand([2023, 2024, 2025]);
    const mesEnvio = randInt(1, 12);

    envios.push({
      colaboradorId: colab.id,
      anoEnvio,
      mesEnvio,
      tipoBrinde: rand(['Cesta Básica','Vale Presente','Produto Personalizado','Voucher Digital']),
      status: rand(['PENDENTE','ENVIADO','ENTREGUE','CANCELADO']),
      dataEnvio: new Date(anoEnvio, mesEnvio - 1, randInt(1, 28)),
      organizacaoId: org.id,
    });
  }

  await prisma.envioBrinde.createMany({ data: envios, skipDuplicates: true });
  console.log(`✅ ${envios.length} envios de brinde simulados`);

  // Notificações
  const notifications = [];
  const qtdNotif = Math.min(30, allColabs.length);

  for (let i = 0; i < qtdNotif; i++) {
    const colab = rand(allColabs);
    notifications.push({
      usuarioId: user.id,
      tipo: rand(['ANIVERSARIO','ENVIO_BRINDE','SISTEMA']),
      titulo: `Notificação sobre ${colab.nome}`,
      mensagem: `Aniversário ou envio relacionado a ${colab.nome}`,
      lida: Math.random() > 0.5,
      organizacaoId: org.id,
    });
  }

  await prisma.notificacao.createMany({ data: notifications, skipDuplicates: true });
  console.log(`✅ ${notifications.length} notificações criadas`);

  console.log('🎉 Seed populacional concluído com sucesso!');
  console.log(`📊 Total: ${colaboradores.length} colaboradores, ${envios.length} envios, ${notifications.length} notificações`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
