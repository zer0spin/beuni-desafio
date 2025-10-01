/**
 * EnvioBrindes Repository
 * Repository Pattern: Separate data access logic from business logic
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';
import { EnvioStatus } from '../../../common/constants/envio-brindes.constants';

export interface EnvioBrindeWhereClause {
  anoAniversario?: number;
  status?: string;
  colaboradorId?: string;
  colaborador?: {
    organizationId: string;
  };
}

export interface PaginationParams {
  skip: number;
  take: number;
}

@Injectable()
export class EnvioBrindesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    where: EnvioBrindeWhereClause,
    pagination: PaginationParams,
    includeRelations = true
  ) {
    return this.prisma.envioBrinde.findMany({
      where,
      include: includeRelations ? {
        colaborador: {
          include: {
            endereco: true,
            organizacao: true,
          },
        },
      } : undefined,
      orderBy: [
        { status: 'asc' },
        { dataGatilhoEnvio: 'desc' },
        { createdAt: 'desc' },
      ],
      ...pagination,
    });
  }

  async count(where: EnvioBrindeWhereClause): Promise<number> {
    return this.prisma.envioBrinde.count({ where });
  }

  async findByStatus(status: EnvioStatus) {
    return this.prisma.envioBrinde.findMany({
      where: { status },
      include: {
        colaborador: {
          include: {
            endereco: true,
            organizacao: true,
          },
        },
      },
      orderBy: {
        dataGatilhoEnvio: 'asc',
      },
    });
  }

  async create(data: {
    colaboradorId: string;
    anoAniversario: number;
    status: string;
    dataGatilhoEnvio?: Date;
  }) {
    return this.prisma.envioBrinde.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.envioBrinde.update({
      where: { id },
      data,
      include: {
        colaborador: {
          include: {
            endereco: true,
          },
        },
      },
    });
  }

  async findByIdAndOrganization(
    id: string,
    organizationId: string
  ) {
    return this.prisma.envioBrinde.findFirst({
      where: {
        id,
        colaborador: {
          organizationId
        }
      },
      include: {
        colaborador: true
      }
    });
  }

  async groupByStatus(
    anoAniversario: number,
    organizationId: string
  ) {
    return this.prisma.envioBrinde.groupBy({
      by: ['status'],
      where: {
        anoAniversario,
        colaborador: {
          organizationId,
        },
      },
      _count: {
        status: true,
      },
    });
  }

  async findUnique(colaboradorId: string, anoAniversario: number) {
    return this.prisma.envioBrinde.findUnique({
      where: {
        colaboradorId_anoAniversario: {
          colaboradorId,
          anoAniversario,
        },
      },
    });
  }
}
