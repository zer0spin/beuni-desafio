// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nomes brasileiros para os colaboradores
const nomes = [
  'Ana Beatriz Ferreira', 'Bruno César Oliveira', 'Camila Duarte Silva', 'Diego Henrique Costa',
  'Eduarda Mendes Rocha', 'Felipe Gabriel Santos', 'Gabriela Alves Lima', 'Henrique José Cardoso',
  'Isabela Maria Souza', 'João Vítor Barbosa', 'Karina Cristina Dias', 'Lucas Eduardo Martins',
  'Mariana Paula Moreira', 'Nathan Rafael Pereira', 'Olívia Vitória Ribeiro', 'Paulo Augusto Gomes',
  'Quésia Fernanda Torres', 'Rodrigo André Melo', 'Sabrina Carla Araujo', 'Thiago Antônio Freitas',
  'Úrsula Beatriz Correia', 'Vinícius Daniel Nunes', 'Wendy Patrícia Lopes', 'Xavier Bruno Teixeira',
  'Yasmin Caroline Campos', 'Zoe Amanda Castro', 'André Felipe Nascimento', 'Bianca Letícia Ramos',
  'Carlos Eduardo Monteiro', 'Daniela Regina Moura', 'Emanuel José Cavalcanti', 'Fabiana Cristiane Pinto',
  'Gustavo Leonardo Silva', 'Helena Isabel Borges', 'Igor Matheus Cunha', 'Juliana Aparecida Rezende',
  'Kevin Renato Macedo', 'Larissa Adriana Fonseca', 'Marcelo Roberto Guimarães', 'Natália Simone Brito',
  'Otávio Fernando Azevedo', 'Priscila Vanessa Miranda', 'Quintino César Pacheco', 'Rafaela Suzana Viana',
  'Samuel Pedro Andrade', 'Tatiana Márcia Siqueira', 'Ulisses João Prado', 'Valéria Cláudia Nogueira',
  'William Diego Carvalho', 'Ximena Patrícia Sampaio', 'Yuri Alexandre Tavares', 'Zilda Rosa Mendonça'
];

const cargos = [
  'Desenvolvedor Full Stack', 'Analista de Sistemas', 'Designer Gráfico', 'Gerente de Projetos',
  'Especialista em Marketing Digital', 'Analista de Recursos Humanos', 'Coordenador de Vendas',
  'Especialista em Dados', 'Analista Financeiro', 'Assistente Administrativo', 'Técnico de Suporte',
  'Coordenador de TI', 'Analista de Qualidade', 'Especialista em UX', 'Gerente Comercial',
  'Analista de Business Intelligence', 'Coordenador de Marketing', 'Especialista em SEO',
  'Desenvolvedor Mobile', 'Analista de Segurança da Informação', 'Gestor de Pessoas',
  'Coordenador de Operações', 'Especialista em E-commerce', 'Analista de Processos',
  'Desenvolvedor Frontend', 'Analista de Infraestrutura', 'Especialista em CRM',
  'Coordenador de Produtos', 'Analista de Comunicação', 'Especialista em Cloud Computing'
];

const departamentos = [
  'Tecnologia', 'Design', 'Marketing', 'Recursos Humanos', 'Comercial', 'Financeiro',
  'Operações', 'Produtos', 'Qualidade', 'Infraestrutura', 'Dados', 'Comunicação'
];

// Endereços em diferentes cidades brasileiras
const enderecosData = [
  { cep: '01310100', logradouro: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
  { cep: '22071900', logradouro: 'Avenida Atlântica', numero: '2000', bairro: 'Copacabana', cidade: 'Rio de Janeiro', uf: 'RJ' },
  { cep: '30112000', logradouro: 'Avenida Afonso Pena', numero: '1500', bairro: 'Centro', cidade: 'Belo Horizonte', uf: 'MG' },
  { cep: '80020320', logradouro: 'Rua das Flores', numero: '456', bairro: 'Centro', cidade: 'Curitiba', uf: 'PR' },
  { cep: '90040191', logradouro: 'Rua dos Andradas', numero: '1001', bairro: 'Centro Histórico', cidade: 'Porto Alegre', uf: 'RS' },
  { cep: '40070110', logradouro: 'Avenida Sete de Setembro', numero: '300', bairro: 'Centro', cidade: 'Salvador', uf: 'BA' },
  { cep: '50050400', logradouro: 'Avenida Boa Viagem', numero: '5000', bairro: 'Boa Viagem', cidade: 'Recife', uf: 'PE' },
  { cep: '60160230', logradouro: 'Avenida Beira Mar', numero: '2500', bairro: 'Meireles', cidade: 'Fortaleza', uf: 'CE' },
  { cep: '70040010', logradouro: 'Esplanada dos Ministérios', numero: '100', bairro: 'Zona Cívico-Administrativa', cidade: 'Brasília', uf: 'DF' },
  { cep: '69005040', logradouro: 'Avenida Eduardo Ribeiro', numero: '666', bairro: 'Centro', cidade: 'Manaus', uf: 'AM' }
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateBirthdayInRange(startDate: Date, endDate: Date): Date {
  // Gerar data de nascimento entre 1980 e 2000 com aniversário na faixa especificada
  const yearOfBirth = 1980 + Math.floor(Math.random() * 20); // Entre 1980 e 2000
  const month = startDate.getMonth();
  const day = startDate.getDate() + Math.floor(Math.random() * (endDate.getDate() - startDate.getDate() + 1));
  
  return new Date(yearOfBirth, month, day);
}

async function main() {
  console.log('🎂 Adicionando colaboradores com aniversários nos próximos 5 dias...');

  // Buscar a organização existente
  const organizacao = await prisma.organizacao.findFirst({
    where: { nome: 'Beuni Demo Company' }
  });

  if (!organizacao) {
    console.error('❌ Organização não encontrada. Execute o seed principal primeiro.');
    return;
  }

  // Data atual e próximos 5 dias
  const hoje = new Date();
  const proximosDias = new Date();
  proximosDias.setDate(hoje.getDate() + 5);

  console.log(`📅 Adicionando colaboradores com aniversário entre ${hoje.toLocaleDateString('pt-BR')} e ${proximosDias.toLocaleDateString('pt-BR')}`);

  // Criar colaboradores com aniversários nos próximos 5 dias
  const colaboradoresParaCriar = [];
  const numColaboradores = 48; // "algumas poucas dezenas"

  for (let i = 0; i < numColaboradores; i++) {
    // Distribuir aniversários pelos próximos 6 dias (hoje + 5)
    const diaAniversario = new Date();
    diaAniversario.setDate(hoje.getDate() + (i % 6));
    
    const dataNascimento = generateBirthdayInRange(diaAniversario, diaAniversario);
    
    // Criar endereço único para cada colaborador
    const enderecoData = getRandomElement(enderecosData);
    const endereco = await prisma.endereco.create({
      data: {
        ...enderecoData,
        numero: String(Math.floor(Math.random() * 9000) + 1000), // Número aleatório
        complemento: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 100) + 1}` : undefined
      }
    });
    
    colaboradoresParaCriar.push({
      nomeCompleto: nomes[i % nomes.length],
      dataNascimento,
      cargo: getRandomElement(cargos),
      departamento: getRandomElement(departamentos),
      organizationId: organizacao.id,
      addressId: endereco.id
    });
  }

  // Inserir colaboradores no banco
  const colaboradoresCriados = [];
  for (const colaboradorData of colaboradoresParaCriar) {
    const colaborador = await prisma.colaborador.create({
      data: colaboradorData
    });
    colaboradoresCriados.push(colaborador);
  }

  // Criar registros de envio de brinde para os novos colaboradores
  console.log('🎁 Criando registros de envio de brinde para os novos colaboradores...');
  
  const anoAtual = new Date().getFullYear();
  
  for (const colaborador of colaboradoresCriados) {
    // Verificar se o aniversário já passou este ano
    const aniversarioEsteAno = new Date(anoAtual, colaborador.dataNascimento.getMonth(), colaborador.dataNascimento.getDate());
    const jaPassou = aniversarioEsteAno < hoje;
    
    if (!jaPassou) {
      // Se o aniversário ainda não passou, criar registro pendente ou pronto para envio
      const diasParaAniversario = Math.floor((aniversarioEsteAno.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
  let status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO' = 'PENDENTE';
      let dataGatilhoEnvio = null;
      
      if (diasParaAniversario <= 7) {
  status = 'PRONTO_PARA_ENVIO';
        dataGatilhoEnvio = new Date();
        dataGatilhoEnvio.setDate(aniversarioEsteAno.getDate() - 7);
      }
      
      await prisma.envioBrinde.create({
        data: {
          colaboradorId: colaborador.id,
          anoAniversario: anoAtual,
          status,
          dataGatilhoEnvio,
          observacoes: `Colaborador com aniversário em ${aniversarioEsteAno.toLocaleDateString('pt-BR')}`
        }
      });
    }

    // Criar registro para o ano anterior (já enviado)
    await prisma.envioBrinde.create({
      data: {
        colaboradorId: colaborador.id,
        anoAniversario: anoAtual - 1,
  status: 'ENVIADO',
        dataGatilhoEnvio: new Date(anoAtual - 1, colaborador.dataNascimento.getMonth(), colaborador.dataNascimento.getDate() - 7),
        dataEnvioRealizado: new Date(anoAtual - 1, colaborador.dataNascimento.getMonth(), colaborador.dataNascimento.getDate() - 3),
        observacoes: 'Enviado com sucesso no ano anterior'
      }
    });
  }

  // Estatísticas dos aniversários criados
  const aniversariosPorDia = {};
  colaboradoresCriados.forEach(colaborador => {
    const aniversario = new Date(anoAtual, colaborador.dataNascimento.getMonth(), colaborador.dataNascimento.getDate());
    const key = aniversario.toLocaleDateString('pt-BR');
    aniversariosPorDia[key] = (aniversariosPorDia[key] || 0) + 1;
  });

  console.log('✅ Colaboradores com aniversários próximos adicionados com sucesso!');
  console.log(`👥 ${colaboradoresCriados.length} novos colaboradores criados`);
  console.log('📊 Distribuição de aniversários:');
  Object.entries(aniversariosPorDia).forEach(([data, quantidade]) => {
    console.log(`   ${data}: ${quantidade} aniversariante(s)`);
  });
  console.log(`🎁 ${colaboradoresCriados.length * 2} novos registros de envio de brinde criados`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });