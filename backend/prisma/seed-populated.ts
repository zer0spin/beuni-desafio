// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helpers
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function date(y: number, m: number, d: number): Date { return new Date(y, m, d); }

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

function randomBirthDate(): Date {
  const year = randInt(1970, 2003); // 22-55+ anos
  const month = randInt(0, 11);
  const day = randInt(1, 28); // simplificação para evitar problemas de dia inválido
  return new Date(year, month, day);
}

function buildFullName(): string {
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

  const senhaHash = await bcrypt.hash('123456', 10);
  await prisma.usuario.upsert({
    where: { email: 'ana.rh@beunidemo.com' },
    update: {},
    create: { nome: 'Ana Silva', email: 'ana.rh@beunidemo.com', senhaHash, organizationId: org.id },
  });

  // Criar N colaboradores (>= 100) distribuindo aniversários ao longo do ano
  const totalColabs = 120;
  const colaboradores = [] as { id: string }[];

  for (let i = 0; i < totalColabs; i++) {
    const city = rand(cidades);
    const endereco = await prisma.endereco.create({
      data: {
        cep: city.cep,
        logradouro: `${city.logradouro}`,
        numero: String(randInt(1, 9999)),
        complemento: Math.random() > 0.7 ? `Apto ${randInt(1, 999)}` : null,
        bairro: city.bairro,
        cidade: city.cidade,
        uf: city.uf,
      },
    });

    const colaborador = await prisma.colaborador.create({
      data: {
        nomeCompleto: buildFullName(),
        dataNascimento: randomBirthDate(),
        cargo: rand(cargos),
        departamento: rand(departamentos),
        organizationId: org.id,
        addressId: endereco.id,
      },
      select: { id: true },
    });

    colaboradores.push(colaborador);
  }

  console.log(`👥 ${colaboradores.length} colaboradores criados.`);

  // Criar envios para múltiplos anos e status
  // Para cada colaborador, cria registros para (anoAtual-2 .. anoAtual+1) com status variados
  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1];

  let totalEnvios = 0;

  for (const col of colaboradores) {
    const c = await prisma.colaborador.findUnique({ where: { id: col.id } });
    if (!c) continue;

    for (const ano of anos) {
      const aniversario = new Date(ano, c.dataNascimento.getMonth(), c.dataNascimento.getDate());

      // Sortear status orientado ao tempo
  let status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
      const hoje = new Date();
      if (ano < anoAtual) {
        // Anos anteriores: mix de ENVIADO/ENTREGUE/CANCELADO
  status = rand(['ENVIADO', 'ENTREGUE', 'CANCELADO']);
      } else if (ano === anoAtual) {
        // Ano atual: distribuir ao longo do pipeline
    const roll = Math.random();
    if (roll < 0.25) status = 'PENDENTE';
    else if (roll < 0.5) status = 'PRONTO_PARA_ENVIO';
    else if (roll < 0.75) status = 'ENVIADO';
    else status = 'ENTREGUE';
      } else {
        // Próximo ano: pendente
    status = 'PENDENTE';
      }

      // Data de gatilho (7 dias úteis antes) simplificada aqui como -9 corridos
      const dataGatilhoEnvio = new Date(aniversario);
      dataGatilhoEnvio.setDate(dataGatilhoEnvio.getDate() - 9);

      // data de envio e entrega (se aplicável)
      let dataEnvioRealizado: Date | null = null;
      if (status === 'ENVIADO' || status === 'ENTREGUE') {
        dataEnvioRealizado = new Date(aniversario);
        dataEnvioRealizado.setDate(aniversario.getDate() - randInt(2, 10));
      }

      await prisma.envioBrinde.create({
        data: {
          colaboradorId: c.id,
          anoAniversario: ano,
          status,
          dataGatilhoEnvio: dataGatilhoEnvio,
          dataEnvioRealizado: dataEnvioRealizado,
          observacoes: `Seed populacional: ${status}`,
        },
      });
      totalEnvios++;
    }
  }

  console.log(`🎁 ${totalEnvios} registros de envio de brinde criados.`);
  console.log('✅ Seed populacional concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed populacional:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
