import {
  Injectable,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { extname, join } from 'path';
import { promises as fs } from 'fs';
import * as sharp from 'sharp';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'profile-images');
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadProfileImage(
    file: any,
    userId: string,
  ): Promise<string> {
    this.validateFile(file);

    const fileExtension = extname(file.originalname).toLowerCase();
    const fileName = `${userId}-${randomUUID()}${fileExtension}`;
    const filePath = join(this.uploadDir, fileName);

    try {
      // Redimensionar e otimizar a imagem
      const processedImage = await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Salvar a imagem processada
      await fs.writeFile(filePath, processedImage);

      // Retornar URL relativa para o frontend
      return `/uploads/profile-images/${fileName}`;
    } catch (error) {
      throw new BadRequestException('Erro ao processar a imagem');
    }
  }

  async deleteProfileImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('/uploads/profile-images/')) {
      return;
    }

    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;

    const filePath = join(this.uploadDir, fileName);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch {
      // Arquivo não existe ou erro ao deletar - ignorar
    }
  }

  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        'Tipo de arquivo não suportado. Use: JPEG, PNG ou WebP',
      );
    }

    const fileExtension = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new UnsupportedMediaTypeException(
        'Extensão de arquivo não suportada',
      );
    }

    // Validar assinatura do arquivo (magic numbers)
    this.validateFileSignature(file.buffer);
  }

  private validateFileSignature(buffer: Buffer): void {
    const signatures = {
      jpeg: [0xff, 0xd8, 0xff],
      png: [0x89, 0x50, 0x4e, 0x47],
      webp: [0x52, 0x49, 0x46, 0x46], // RIFF header para WebP
    };

    let isValid = false;

    for (const [type, signature] of Object.entries(signatures)) {
      if (signature.every((byte, index) => buffer[index] === byte)) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      throw new UnsupportedMediaTypeException(
        'Arquivo não é uma imagem válida',
      );
    }
  }
}