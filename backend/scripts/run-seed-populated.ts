// Script temporário para executar seed populacional
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runSeed() {
  try {
    console.log('🌱 Iniciando execução do seed populacional...');
    
    // Executar o seed
    const { stdout, stderr } = await execAsync('npx ts-node prisma/seed-populated.ts');
    
    if (stdout) {
      console.log('✅ Seed Output:');
      console.log(stdout);
    }
    
    if (stderr) {
      console.log('⚠️ Seed Warnings:');
      console.log(stderr);
    }
    
    console.log('🎉 Seed populacional executado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  }
}

runSeed();