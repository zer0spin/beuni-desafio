import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class TestDataService {
  constructor(private prisma: PrismaService) {}

  async updateEnvioStatusForTesting(): Promise<any> {
    try {
      console.log('🔄 Updating shipment statuses for testing...');
      
      // Get all envio_brindes records
      const envios = await this.prisma.envioBrinde.findMany({
        include: {
          colaborador: {
            select: {
              nomeCompleto: true,
            }
          }
        }
      });

      console.log(`📦 Found ${envios.length} shipments to update`);

      if (envios.length === 0) {
        return { success: false, message: 'No shipments found. Please run seed first.' };
      }

      // Define different statuses to distribute
      const statuses = [
        'PENDENTE',
        'PRONTO_PARA_ENVIO', 
        'ENVIADO',
        'ENTREGUE',
        'CANCELADO'
      ];

      let updates = 0;

      // Update each envio with random status for testing
      for (let i = 0; i < envios.length; i++) {
        const envio = envios[i];
        const statusIndex = i % statuses.length; // Distribute evenly
        const newStatus = statuses[statusIndex];

        // Set appropriate dates based on status
        let dataEnvioRealizado = null;
        let dataGatilhoEnvio = null;

        if (newStatus === 'PRONTO_PARA_ENVIO' || newStatus === 'ENVIADO' || newStatus === 'ENTREGUE') {
          // Set gatilho date (3-7 days ago)
          dataGatilhoEnvio = new Date();
          dataGatilhoEnvio.setDate(dataGatilhoEnvio.getDate() - Math.floor(Math.random() * 4) - 3);
        }

        if (newStatus === 'ENVIADO' || newStatus === 'ENTREGUE') {
          // Set envio date (1-3 days after gatilho)
          dataEnvioRealizado = new Date(dataGatilhoEnvio!);
          dataEnvioRealizado.setDate(dataEnvioRealizado.getDate() + Math.floor(Math.random() * 2) + 1);
        }

        await this.prisma.envioBrinde.update({
          where: { id: envio.id },
          data: {
            status: newStatus as any,
            dataGatilhoEnvio,
            dataEnvioRealizado,
            ...(newStatus === 'CANCELADO' && {
              observacoes: 'Cancelado para teste - endereço inválido'
            }),
            ...(newStatus === 'ENTREGUE' && {
              observacoes: 'Entregue com sucesso'
            }),
            ...(newStatus === 'ENVIADO' && {
              observacoes: 'Enviado via correios'
            })
          }
        });

        updates++;
        console.log(`✅ Updated: ${envio.colaborador.nomeCompleto} -> ${newStatus}`);
      }

      console.log(`🎉 Successfully updated ${updates} shipment statuses!`);
      
      // Show final count by status
      const statusCounts = await this.prisma.envioBrinde.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const distribution = {};
      statusCounts.forEach(item => {
        distribution[item.status] = item._count.status;
      });

      return {
        success: true,
        message: `Successfully updated ${updates} shipment statuses!`,
        distribution
      };

    } catch (error) {
      console.error('❌ Error updating shipment statuses:', error);
      return {
        success: false,
        message: 'Error updating shipment statuses',
        error: error.message
      };
    }
  }
}