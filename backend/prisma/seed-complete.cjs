// Complete seed for Railway SSH execution
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helpers
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const firstNames = ['Ana','Bruno','Camila','Diego','Eduarda','Felipe','Gabriela','Henrique','Isabela','João','Karina','Lucas','Mariana','Nathan','Olívia','Paulo','Rafaela','Sabrina','Thiago','Valéria','William','Yasmin','Zoe','André','Bianca','Carlos','Daniela','Emanuel','Fabiana','Gustavo','Helena','Igor','Juliana','Kevin','Larissa','Marcelo','Natália','Otávio','Priscila','Quésia','Rodrigo','Samuel','Tatiana','Ulisses','Vinícius','Wendy','Xavier','Yuri','Zilda'];
const lastNames = ['Silva','Souza','Oliveira','Santos','Pereira','Lima','Carvalho','Ferreira','Rodrigues','Almeida','Gomes','Martins','Araújo','Melo','Barbosa','Dias','Teixeira','Castro','Moreira','Cardoso'];

const cargos = ['Dev Frontend','Dev Backend','Fullstack Dev','UX Designer','PM','QA','DevOps','Data Analyst','Business Analyst','Analista Financeiro','Assistente Administrativo','Coordenador de TI','Especialista em Cloud','Coordenador de Operações'];
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
  console.log('🌱 Seed completo iniciado...');

  // Limpar dados existentes (exceto usuários admin)
  console.log('🗑️  Limpando dados antigos...');
  await prisma.notificacao.deleteMany({});
  await prisma.envioBrinde.deleteMany({});
  await prisma.colaborador.deleteMany({});

  // Manter organização Beuni HQ e admin user
  const org = await prisma.organizacao.findFirst({ where: { nome: 'Beuni HQ' } });

  if (!org) {
    console.error('❌ Organização Beuni HQ não encontrada. Execute primeiro o script de criação de usuário.');
    process.exit(1);
  }

  console.log(`✅ Usando organização "${org.nome}"`);

  // Verificar se admin existe
  const admin = await prisma.usuario.findUnique({ where: { email: 'admin@beuni.com' } });
  if (admin) {
    console.log(`✅ Admin user encontrado: ${admin.email}`);
  }

  // Criar 120 colaboradores com aniversários distribuídos ao longo do ano
  console.log('👥 Criando colaboradores...');
  const colaboradores = [];

  for (let i = 1; i <= 120; i++) {
    const nome = buildFullName();
    const loc = rand(cidades);
    const dataNascimento = randomBirthDate();

    const endereco = await prisma.endereco.create({
      data: {
        cep: loc.cep,
        logradouro: loc.logradouro,
        numero: randInt(1, 999).toString(),
        complemento: Math.random() > 0.7 ? `Apto ${randInt(1, 200)}` : null,
        bairro: loc.bairro,
        cidade: loc.cidade,
        uf: loc.uf,
      }
    });

    colaboradores.push({
      nomeCompleto: nome,
      dataNascimento,
      cargo: rand(cargos),
      departamento: rand(departamentos),
      organizationId: org.id,
      addressId: endereco.id,
    });
  }

  for (const colab of colaboradores) {
    await prisma.colaborador.create({ data: colab });
  }

  console.log(`✅ ${colaboradores.length} colaboradores criados`);

  // Criar envios de brinde para aniversariantes recentes
  console.log('🎁 Criando envios de brinde...');
  const allColabs = await prisma.colaborador.findMany({
    where: { organizationId: org.id }
  });

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
      tipoBrinde: rand(['Cesta Gourmet','Vale Presente R$100','Produto Personalizado','Voucher Digital']),
      status: rand(['PENDENTE','PRONTO_PARA_ENVIO','ENVIADO','ENTREGUE']),
      dataPrevisaoEnvio: new Date(anoEnvio, mesEnvio - 1, randInt(1, 28)),
      organizationId: org.id,
    });
  }

  for (const envio of envios) {
    await prisma.envioBrinde.create({ data: envio });
  }

  console.log(`✅ ${envios.length} envios de brinde criados`);

  // Criar notificações
  if (admin) {
    console.log('🔔 Criando notificações...');
    const notifications = [];
    const qtdNotif = Math.min(30, allColabs.length);

    for (let i = 0; i < qtdNotif; i++) {
      const colab = rand(allColabs);
      const tipo = rand(['ANIVERSARIO','ENVIO_BRINDE','SISTEMA']);

      let titulo, mensagem;
      if (tipo === 'ANIVERSARIO') {
        titulo = `🎂 Aniversário de ${colab.nomeCompleto}`;
        mensagem = `${colab.nomeCompleto} faz aniversário em breve!`;
      } else if (tipo === 'ENVIO_BRINDE') {
        titulo = `🎁 Brinde para ${colab.nomeCompleto}`;
        mensagem = `O brinde de ${colab.nomeCompleto} está pronto para envio.`;
      } else {
        titulo = `📊 Atualização do sistema`;
        mensagem = `Novos dados de colaboradores disponíveis.`;
      }

      notifications.push({
        usuarioId: admin.id,
        tipo,
        titulo,
        mensagem,
        lida: Math.random() > 0.5,
        organizationId: org.id,
      });
    }

    for (const notif of notifications) {
      await prisma.notificacao.create({ data: notif });
    }

    console.log(`✅ ${notifications.length} notificações criadas`);
  }

  // Estatísticas finais
  const totalColaboradores = await prisma.colaborador.count({ where: { organizationId: org.id } });
  const totalEnvios = await prisma.envioBrinde.count({ where: { organizationId: org.id } });
  const totalNotificacoes = admin ? await prisma.notificacao.count({ where: { usuarioId: admin.id } }) : 0;

  console.log('\n🎉 Seed completo concluído com sucesso!');
  console.log('📊 Estatísticas:');
  console.log(`   - Colaboradores: ${totalColaboradores}`);
  console.log(`   - Envios de brinde: ${totalEnvios}`);
  console.log(`   - Notificações: ${totalNotificacoes}`);
  console.log('\n✅ Dados prontos para teste!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    console.error(e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
