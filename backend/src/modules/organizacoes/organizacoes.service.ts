import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class OrganizacoesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.organizacao.findUnique({
      where: { id },
    });
  }

  async create(nome: string) {
    return this.prisma.organizacao.create({
      data: { nome },
    });
  }
}