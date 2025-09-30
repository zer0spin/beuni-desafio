import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { UpdateOrganizacaoDto } from './dto/update-organizacao.dto';

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

  async update(id: string, updateOrganizacaoDto: UpdateOrganizacaoDto) {
    return this.prisma.organizacao.update({
      where: { id },
      data: {
        nome: updateOrganizacaoDto.name,
      },
      select: {
        id: true,
        nome: true,
      },
    });
  }
}