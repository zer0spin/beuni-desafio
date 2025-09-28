import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: {
        organizacao: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        organizacao: {
          select: { id: true, nome: true },
        },
      },
    });
  }
}