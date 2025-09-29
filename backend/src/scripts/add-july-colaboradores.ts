import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Colaboradores com aniversário em julho e diversos status
const julhoColaboradores = [
  { nome: 'Amanda Santos Silva', cargo: 'Desenvolvedor Frontend', departamento: 'Desenvolvimento', nascimento: '1989-07-03', cep: '01310100', numero: '789', status: 'CANCELADO', ano: 2024 },
  { nome: 'Roberto Carlos Mendes', cargo: 'Gerente de Vendas', departamento: 'Vendas', nascimento: '1983-07-07', cep: '04038001', numero: '123', status: 'ENTREGUE', ano: 2024 },
  { nome: 'Fernanda Lima Rocha', cargo: 'Analista de RH', departamento: 'Recursos Humanos', nascimento: '1991-07-12', cep: '01414000', numero: '456', status: 'ENVIADO', ano: 2024 },
  { nome: 'Carlos Eduardo Santos', cargo: 'DevOps Engineer', departamento: 'Infraestrutura', nascimento: '1987-07-15', cep: '05407002', numero: '321', status: 'PRONTO_PARA_ENVIO', ano: 2024 },
  { nome: 'Juliana Costa Lima', cargo: 'Designer UX/UI', departamento: 'Design', nascimento: '1993-07-18', cep: '04567000', numero: '654', status: 'PENDENTE', ano: 2024 },
  { nome: 'Alexandre Pereira Souza', cargo: 'Product Manager', departamento: 'Produto', nascimento: '1985-07-22', cep: '01310000', numero: '987', status: 'CANCELADO', ano: 2023 },
  { nome: 'Natália Rodrigues Lima', cargo: 'QA/Tester', departamento: 'Qualidade', nascimento: '1990-07-25', cep: '04038000', numero: '147', status: 'ENTREGUE', ano: 2024 },
  { nome: 'Henrique Silva Costa', cargo: 'Scrum Master', departamento: 'Tecnologia', nascimento: '1988-07-28', cep: '01414001', numero: '258', status: 'ENVIADO', ano: 2024 },

  // Colaboradores de anos anteriores para testar histórico
  { nome: 'Isabela Ferreira Santos', cargo: 'Data Scientist', departamento: 'Tecnologia', nascimento: '1986-07-05', cep: '05407001', numero: '369', status: 'ENTREGUE', ano: 2023 },
  { nome: 'Diego Almeida Rocha', cargo: 'Arquiteto de Software', departamento: 'Tecnologia', nascimento: '1984-07-10', cep: '04567001', numero: '741', status: 'CANCELADO', ano: 2023 },
  { nome: 'Camila Santos Oliveira', cargo: 'Analista Administrativo', departamento: 'Administrativo', nascimento: '1992-07-20', cep: '01310200', numero: '852', status: 'ENVIADO', ano: 2023 },
  { nome: 'Rafael Lima Pereira', cargo: 'Suporte Técnico', departamento: 'Suporte', nascimento: '1989-07-30', cep: '04038002', numero: '963', status: 'ENTREGUE', ano: 2023 },

  // Mais colaboradores para 2022 (dados históricos)
  { nome: 'Vanessa Costa Silva', cargo: 'Coordenador de RH', departamento: 'Recursos Humanos', nascimento: '1987-07-02', cep: '01414002', numero: '159', status: 'ENTREGUE', ano: 2022 },
  { nome: 'Marcos Vinícius Santos', cargo: 'Desenvolvedor Backend', departamento: 'Desenvolvimento', nascimento: '1991-07-14', cep: '05407003', numero: '753', status: 'CANCELADO', ano: 2022 },
  { nome: 'Larissa Rodrigues Lima', cargo: 'Analista de Marketing', departamento: 'Marketing', nascimento: '1988-07-26', cep: '04567002', numero: '486', status: 'ENTREGUE', ano: 2022 },

  // Colaboradores com diferentes idades para diversificar
  { nome: 'João Paulo Silva', cargo: 'Estagiário', departamento: 'Desenvolvimento', nascimento: '2001-07-08', cep: '01310300', numero: '123', status: 'PENDENTE', ano: 2024 },
  { nome: 'Maria Eduarda Costa', cargo: 'Estagiário', departamento: 'Design', nascimento: '2002-07-16', cep: '04038003', numero: '456', status: 'PRONTO_PARA_ENVIO', ano: 2024 },
  { nome: 'Antônio Carlos Lima', cargo: 'Diretor de Tecnologia', departamento: 'Diretoria', nascimento: '1975-07-04', cep: '01414003', numero: '789', status: 'ENTREGUE', ano: 2024 },
  { nome: 'Helena Santos Rocha', cargo: 'Gerente de RH', departamento: 'Recursos Humanos', nascimento: '1980-07-11', cep: '05407004', numero: '321', status: 'ENVIADO', ano: 2024 },
  { nome: 'Pedro Henrique Alves', cargo: 'Coordenador de TI', departamento: 'Tecnologia', nascimento: '1982-07-19', cep: '04567003', numero: '654', status: 'CANCELADO', ano: 2024 },
];

async function main() {
  console.log('🎂 Adicionando colaboradores com aniversário em julho...');

  try {
    // Buscar organização existente
    const organization = await prisma.organizacao.findFirst();

    if (!organization) {
      console.error('❌ Nenhuma organização encontrada.');
      return;
    }

    // Função para buscar dados do CEP (simulada)
    const getCepData = (cep: string) => {
      const cepData: Record<string, any> = {
        '01310100': { logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
        '04038001': { logradouro: 'Rua Vergueiro', bairro: 'Vila Mariana', cidade: 'São Paulo', uf: 'SP' },
        '01414000': { logradouro: 'Rua Augusta', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP' },
        '05407002': { logradouro: 'Rua dos Pinheiros', bairro: 'Pinheiros', cidade: 'São Paulo', uf: 'SP' },
        '04567000': { logradouro: 'Avenida Ibirapuera', bairro: 'Moema', cidade: 'São Paulo', uf: 'SP' },
      };
      return cepData[cep] || { logradouro: 'Rua das Flores', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' };
    };

    let count = 0;

    for (const colaboradorData of julhoColaboradores) {
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

          // Criar registro de envio de brinde com status específico
          const dataEnvio = colaboradorData.status === 'ENVIADO' || colaboradorData.status === 'ENTREGUE' ? new Date(`${colaboradorData.ano}-07-${Math.floor(Math.random() * 25) + 1}`) : null;

          await tx.envioBrinde.create({
            data: {
              colaboradorId: colaborador.id,
              anoAniversario: colaboradorData.ano,
              status: colaboradorData.status as any,
              dataEnvioRealizado: dataEnvio,
              dataGatilhoEnvio: colaboradorData.status === 'PRONTO_PARA_ENVIO' ? new Date(`${colaboradorData.ano}-07-${Math.floor(Math.random() * 25) + 1}`) : null,
              observacoes: colaboradorData.status === 'CANCELADO' ? 'Cancelado por mudança de endereço' : null,
            },
          });
        });

        count++;
        if (count % 5 === 0) {
          console.log(`📈 Criados ${count} colaboradores de julho...`);
        }
      } catch (error) {
        console.error(`❌ Erro ao criar colaborador ${colaboradorData.nome}:`, error);
      }
    }

    console.log(`🎉 Adição concluída! Total de ${count} colaboradores de julho criados.`);

    // Estatísticas dos novos colaboradores
    const julhoStats = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM colaboradores c
      WHERE c.organization_id = ${organization.id}
      AND EXTRACT(MONTH FROM c.data_nascimento) = 7
    `;

    console.log(`📊 Total de colaboradores com aniversário em julho: ${(julhoStats as any)[0].total}`);

    // Estatísticas por status em julho
    const statusStats = await prisma.$queryRaw`
      SELECT eb.status, COUNT(*) as total FROM envios_brinde eb
      JOIN colaboradores c ON eb.colaborador_id = c.id
      WHERE c.organization_id = ${organization.id}
      AND EXTRACT(MONTH FROM c.data_nascimento) = 7
      GROUP BY eb.status
      ORDER BY total DESC
    `;

    console.log('📋 Status dos envios em julho:');
    (statusStats as any).forEach((stat: any) => {
      console.log(`  ${stat.status}: ${stat.total} colaboradores`);
    });

  } catch (error) {
    console.error('❌ Erro durante a adição:', error);
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