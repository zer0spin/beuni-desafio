import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Criando usuário de teste...');

  try {
    // Buscar organização existente
    const organization = await prisma.organizacao.findFirst();

    if (!organization) {
      console.error('❌ Nenhuma organização encontrada. Execute primeiro o seed de colaboradores.');
      return;
    }

    // Verificar se já existe usuário de teste
    const existingUser = await prisma.usuario.findFirst({
      where: { email: 'admin@beuni.com.br' }
    });

    if (existingUser) {
      console.log('ℹ️  Usuário de teste já existe: admin@beuni.com.br');
      return;
    }

    // Criar hash da senha
    const senhaHash = await bcrypt.hash('123456', 10);

    // Criar usuário de teste
    const user = await prisma.usuario.create({
      data: {
        nome: 'Admin Beuni',
        email: 'admin@beuni.com.br',
        senhaHash,
        organizationId: organization.id,
      }
    });

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('📧 Email: admin@beuni.com.br');
    console.log('🔑 Senha: 123456');
    console.log(`🏢 Organização: ${organization.nome}`);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
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