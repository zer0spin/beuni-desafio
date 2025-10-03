// Script para verificar usuários existentes no banco
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários existentes...');
    
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        organizationId: true,
      }
    });

    console.log(`📊 Total de usuários: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco!');
      console.log('🌱 Executando seed básico...');
      
      // Criar organização padrão
      const org = await prisma.organizacao.upsert({
        where: { id: 'demo-org-id' },
        update: {},
        create: { 
          id: 'demo-org-id', 
          nome: 'Beuni Demo Company' 
        },
      });

      // Criar usuário Ana
      const bcrypt = await import('bcryptjs');
      const senhaHash = await bcrypt.hash('123456', 10);
      
      const ana = await prisma.usuario.upsert({
        where: { email: 'ana.rh@beunidemo.com' },
        update: {},
        create: { 
          nome: 'Ana Silva', 
          email: 'ana.rh@beunidemo.com', 
          senhaHash, 
          organizationId: org.id 
        },
      });

      console.log('✅ Usuário Ana criado:', ana.email);
      
      // Criar usuário developer.marcos.oliveira
      const marcos = await prisma.usuario.upsert({
        where: { email: 'developer.marcos.oliveira@gmail.com' },
        update: {},
        create: { 
          nome: 'Marcos Vinícius de Oliveira Firmino', 
          email: 'developer.marcos.oliveira@gmail.com', 
          senhaHash, 
          organizationId: org.id 
        },
      });

      console.log('✅ Usuário Marcos criado:', marcos.email);
      
    } else {
      console.log('👥 Usuários encontrados:');
      users.forEach(user => {
        console.log(`  - ${user.nome} (${user.email})`);
      });
    }

    // Verificar colaboradores
    const colabCount = await prisma.colaborador.count();
    console.log(`👔 Total de colaboradores: ${colabCount}`);

    // Verificar organizações
    const orgs = await prisma.organizacao.findMany();
    console.log(`🏢 Organizações:`, orgs.map(o => o.nome));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();