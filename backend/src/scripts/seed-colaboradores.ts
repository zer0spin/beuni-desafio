import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dados de teste para colaboradores
const colaboradoresData = [
  // Tecnologia/Desenvolvimento
  { nome: 'Ana Silva Santos', cargo: 'Desenvolvedor Frontend', departamento: 'Desenvolvimento', nascimento: '1990-03-15', cep: '01310100', numero: '150' },
  { nome: 'Carlos Eduardo Oliveira', cargo: 'Desenvolvedor Backend', departamento: 'Desenvolvimento', nascimento: '1988-07-22', cep: '04038001', numero: '280' },
  { nome: 'Mariana Costa Lima', cargo: 'Desenvolvedor Fullstack', departamento: 'Tecnologia', nascimento: '1992-11-08', cep: '01414000', numero: '95' },
  { nome: 'Felipe Santos Rocha', cargo: 'DevOps Engineer', departamento: 'Infraestrutura', nascimento: '1985-05-03', cep: '05407002', numero: '450' },
  { nome: 'Juliana Ferreira Alves', cargo: 'QA/Tester', departamento: 'Qualidade', nascimento: '1991-09-17', cep: '04567000', numero: '310' },
  { nome: 'Ricardo Pereira Souza', cargo: 'Tech Lead', departamento: 'Tecnologia', nascimento: '1983-12-12', cep: '01310000', numero: '200' },
  { nome: 'Fernanda Lima Castro', cargo: 'Designer UX/UI', departamento: 'Design', nascimento: '1993-04-25', cep: '04038000', numero: '125' },
  { nome: 'Gabriel Martins Silva', cargo: 'Desenvolvedor Mobile', departamento: 'Desenvolvimento', nascimento: '1989-08-30', cep: '01414001', numero: '75' },

  // Gestão e Produto
  { nome: 'Patrícia Rodrigues Lima', cargo: 'Product Manager', departamento: 'Produto', nascimento: '1987-02-14', cep: '05407001', numero: '380' },
  { nome: 'Thiago Almeida Costa', cargo: 'Scrum Master', departamento: 'Tecnologia', nascimento: '1986-10-05', cep: '04567001', numero: '220' },
  { nome: 'Camila Santos Oliveira', cargo: 'Arquiteto de Software', departamento: 'Tecnologia', nascimento: '1984-06-18', cep: '01310200', numero: '88' },
  { nome: 'Daniel Ferreira Rocha', cargo: 'Coordenador de TI', departamento: 'Tecnologia', nascimento: '1982-01-27', cep: '04038002', numero: '155' },

  // Dados e Análise
  { nome: 'Larissa Moreira Santos', cargo: 'Data Scientist', departamento: 'Tecnologia', nascimento: '1990-12-03', cep: '01414002', numero: '42' },
  { nome: 'Bruno Silva Alves', cargo: 'Data Analyst', departamento: 'Tecnologia', nascimento: '1991-05-20', cep: '05407003', numero: '267' },
  { nome: 'Rafaela Costa Pereira', cargo: 'Business Analyst', departamento: 'Administrativo', nascimento: '1989-07-11', cep: '04567002', numero: '199' },
  { nome: 'Leonardo Santos Lima', cargo: 'Analista de Sistemas', departamento: 'Tecnologia', nascimento: '1988-03-08', cep: '01310300', numero: '333' },

  // RH e Administrativo
  { nome: 'Priscila Oliveira Castro', cargo: 'Gerente de RH', departamento: 'Recursos Humanos', nascimento: '1985-11-22', cep: '04038003', numero: '90' },
  { nome: 'Roberto Almeida Silva', cargo: 'Analista de RH', departamento: 'Recursos Humanos', nascimento: '1990-08-15', cep: '01414003', numero: '178' },
  { nome: 'Vanessa Lima Rodrigues', cargo: 'Coordenador de RH', departamento: 'Recursos Humanos', nascimento: '1987-04-30', cep: '05407004', numero: '412' },
  { nome: 'Anderson Costa Santos', cargo: 'Assistente Administrativo', departamento: 'Administrativo', nascimento: '1992-02-28', cep: '04567003', numero: '256' },
  { nome: 'Bianca Ferreira Lima', cargo: 'Analista Administrativo', departamento: 'Administrativo', nascimento: '1991-09-07', cep: '01310400', numero: '67' },

  // Vendas e Marketing
  { nome: 'Marcelo Santos Oliveira', cargo: 'Gerente de Vendas', departamento: 'Vendas', nascimento: '1984-06-12', cep: '04038004', numero: '144' },
  { nome: 'Cristina Almeida Rocha', cargo: 'Analista de Marketing', departamento: 'Marketing', nascimento: '1990-10-25', cep: '01414004', numero: '234' },
  { nome: 'Gustavo Lima Pereira', cargo: 'Coordenador Comercial', departamento: 'Comercial', nascimento: '1986-01-17', cep: '05407005', numero: '389' },

  // Suporte e Operações
  { nome: 'Aline Costa Silva', cargo: 'Suporte Técnico', departamento: 'Suporte', nascimento: '1993-05-09', cep: '04567004', numero: '156' },
  { nome: 'Paulo Rodrigues Santos', cargo: 'Administrador de Redes', departamento: 'Infraestrutura', nascimento: '1987-12-04', cep: '01310500', numero: '78' },
  { nome: 'Tatiana Oliveira Lima', cargo: 'Analista de Operações', departamento: 'Operações', nascimento: '1989-03-21', cep: '04038005', numero: '321' },

  // Diversos
  { nome: 'João Carlos Almeida', cargo: 'Motorista', departamento: 'Facilities', nascimento: '1978-08-14', cep: '01414005', numero: '445' },
  { nome: 'Maria Fernanda Costa', cargo: 'Recepcionista', departamento: 'Administrativo', nascimento: '1995-01-05', cep: '05407006', numero: '123' },
  { nome: 'José Roberto Silva', cargo: 'Porteiro', departamento: 'Facilities', nascimento: '1975-11-30', cep: '04567005', numero: '89' },
  { nome: 'Sandra Lima Rocha', cargo: 'Auxiliar de Limpeza', departamento: 'Facilities', nascimento: '1980-04-18', cep: '01310600', numero: '234' },

  // Estagiários
  { nome: 'Lucas Ferreira Santos', cargo: 'Estagiário', departamento: 'Desenvolvimento', nascimento: '2000-07-10', cep: '04038006', numero: '567' },
  { nome: 'Isabella Costa Lima', cargo: 'Estagiário', departamento: 'Design', nascimento: '2001-02-22', cep: '01414006', numero: '111' },
  { nome: 'Matheus Silva Oliveira', cargo: 'Estagiário', departamento: 'Marketing', nascimento: '2000-12-15', cep: '05407007', numero: '298' },

  // Diretoria
  { nome: 'Eduardo Santos Pereira', cargo: 'Diretor de Tecnologia', departamento: 'Diretoria', nascimento: '1975-09-28', cep: '04567006', numero: '1' },
  { nome: 'Claudia Rodrigues Lima', cargo: 'Gerente de TI', departamento: 'Tecnologia', nascimento: '1981-06-07', cep: '01310700', numero: '45' },
];

async function main() {
  console.log('🌱 Iniciando população do banco de dados com colaboradores...');

  try {
    // Primeiro, vamos buscar uma organização existente ou criar uma
    let organization = await prisma.organizacao.findFirst();

    if (!organization) {
      console.log('📋 Criando organização de teste...');
      organization = await prisma.organizacao.create({
        data: {
          nome: 'Beuni Tecnologia',
        }
      });
      console.log(`✅ Organização criada: ${organization.nome}`);
    }

    // Função para buscar dados do CEP (simulada para os CEPs de teste)
    const getCepData = (cep: string) => {
      const cepData: Record<string, any> = {
        '01310100': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038001': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414000': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407002': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567000': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
        '01310000': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038000': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414001': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407001': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567001': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
        '01310200': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038002': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414002': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407003': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567002': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
        '01310300': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038003': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414003': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407004': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567003': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
        '01310400': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038004': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414004': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407005': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567004': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
        '01310500': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038005': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414005': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407006': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567005': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
        '01310600': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038006': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414006': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407007': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567006': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
        '01310700': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
      };
      return cepData[cep] || { logradouro: 'Rua Exemplo', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' };
    };

    let count = 0;

    for (const colaboradorData of colaboradoresData) {
      try {
        const cepInfo = getCepData(colaboradorData.cep);

        await prisma.$transaction(async (tx) => {
          // Criar endereço
          const endereco = await tx.endereco.create({
            data: {
              cep: colaboradorData.cep,
              logradouro: cepInfo.logradouro,
              numero: colaboradorData.numero,
              complemento: null,
              bairro: cepInfo.bairro,
              cidade: cepInfo.cidade,
              uf: cepInfo.uf,
            },
          });

          // Criar colaborador
          const colaborador = await tx.colaborador.create({
            data: {
              nomeCompleto: colaboradorData.nome,
              dataNascimento: new Date(colaboradorData.nascimento),
              cargo: colaboradorData.cargo,
              departamento: colaboradorData.departamento,
              organizationId: organization.id,
              addressId: endereco.id,
            },
          });

          // Criar registro de envio de brinde para o ano atual
          const anoAtual = new Date().getFullYear();
          await tx.envioBrinde.create({
            data: {
              colaboradorId: colaborador.id,
              anoAniversario: anoAtual,
              status: count % 4 === 0 ? 'ENVIADO' : count % 3 === 0 ? 'ENTREGUE' : count % 2 === 0 ? 'PRONTO_PARA_ENVIO' : 'PENDENTE',
              dataEnvioRealizado: count % 4 === 0 ? new Date() : null,
            },
          });
        });

        count++;
        if (count % 5 === 0) {
          console.log(`📈 Criados ${count} colaboradores...`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar colaborador ${colaboradorData.nome}:`, error);
      }
    }

    console.log(`🎉 População concluída! Total de ${count} colaboradores criados.`);

    // Estatísticas
    const stats = await prisma.colaborador.groupBy({
      by: ['departamento'],
      _count: { departamento: true },
      where: { organizationId: organization.id }
    });

    console.log('\n📊 Estatísticas por departamento:');
    stats.forEach(stat => {
      console.log(`  ${stat.departamento}: ${stat._count.departamento} colaboradores`);
    });

  } catch (error) {
    console.error('❌ Erro durante a população:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  });