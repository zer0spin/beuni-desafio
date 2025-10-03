// Script para debug - verificar arquivos no container
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Debug: Verificando estrutura de arquivos...');
console.log('📂 Current working directory:', process.cwd());

const publicPath = join(process.cwd(), 'public');
const defaultImagePath = join(process.cwd(), 'public', 'default-profile.png');
const uploadsPath = join(process.cwd(), 'uploads');

console.log('📁 Public folder exists:', existsSync(publicPath));
console.log('🖼️ Default image exists:', existsSync(defaultImagePath));
console.log('📁 Uploads folder exists:', existsSync(uploadsPath));

if (existsSync(publicPath)) {
  console.log('📂 Public folder contents:');
  const fs = require('fs');
  try {
    const files = fs.readdirSync(publicPath);
    files.forEach((file: string) => {
      console.log(`  - ${file}`);
    });
  } catch (error) {
    console.log('❌ Error reading public folder:', error);
  }
}

console.log('✅ Debug complete');