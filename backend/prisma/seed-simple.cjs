// Simple seed for Railway - adds data without deleting
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const firstNames = ['Ana','Bruno','Camila','Diego','Eduarda','Felipe','Gabriela','Henrique','Isabela','João'];
const lastNames = ['Silva','Souza','Oliveira','Santos','Pereira'];
const cargos = ['Dev Frontend','Dev Backend','UX Designer','PM','QA'];
const departamentos = ['Tecnologia','Desenvolvimento','Design','Produto'];

const cidades = [
  {cep:'01310100', logradouro:'Avenida Paulista', cidade:'São Paulo', uf:'SP', bairro:'Bela Vista'},
  {cep:'22071900', logradouro:'Avenida Atlântica', cidade:'Rio de Janeiro', uf:'RJ', bairro:'Copacabana'},
  {cep:'30112000', logradouro:'Avenida Afonso Pena', cidade:'Belo Horizonte', uf:'MG', bairro:'Centro'}
];

function randomBirthDate() {
  const year = randInt(1980, 2000);
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  return new Date(year, month, day);
}

async function main() {
  console.log('🌱 Seed simples iniciado...');

  // Busca a primeira organização (funciona com qualquer nome)
  const org = await prisma.organizacao.findFirst();
  if (!org) {
    console.error('❌ Nenhuma organização encontrada');
    process.exit(1);
  }

  console.log(`✅ Organização: ${org.nome}`);

  // Criar 50 colaboradores
  let created = 0;
  for (let i = 1; i <= 50; i++) {
    try {
      const nome = `${rand(firstNames)} ${rand(lastNames)}`;
      const loc = rand(cidades);

      const endereco = await prisma.endereco.create({
        data: {
          cep: loc.cep,
          logradouro: loc.logradouro,
          numero: randInt(1, 500).toString(),
          bairro: loc.bairro,
          cidade: loc.cidade,
          uf: loc.uf,
        }
      });

      await prisma.colaborador.create({
        data: {
          nomeCompleto: nome,
          dataNascimento: randomBirthDate(),
          cargo: rand(cargos),
          departamento: rand(departamentos),
          organizationId: org.id,
          addressId: endereco.id,
        }
      });

      created++;
      if (created % 10 === 0) console.log(`   ... ${created} colaboradores`);
    } catch (e) {
      // Skip duplicates
    }
  }

  console.log(`✅ ${created} colaboradores criados`);

  // Estatísticas
  const total = await prisma.colaborador.count({ where: { organizationId: org.id } });
  console.log(`📊 Total de colaboradores: ${total}`);
  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
