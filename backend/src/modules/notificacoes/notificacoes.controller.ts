import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificacoesService } from './notificacoes.service';
import { ListarNotificacoesQueryDto, NotificacaoResponseDto } from './dto';

@Controller('notificacoes')
@UseGuards(JwtAuthGuard)
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  async listarNotificacoes(
    @Request() req: any,
    @Query() query: ListarNotificacoesQueryDto,
  ): Promise<NotificacaoResponseDto[]> {
    const organizationId = req.user.organizationId;
    return this.notificacoesService.listarNotificacoes(organizationId, query);
  }

  @Get('count/nao-lidas')
  async contarNaoLidas(@Request() req: any): Promise<{ count: number }> {
    const organizationId = req.user.organizationId;
    return this.notificacoesService.contarNaoLidas(organizationId);
  }

  @Post(':id/marcar-como-lida')
  async marcarComoLida(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.notificacoesService.marcarComoLida(id);
  }

  @Post('marcar-todas-como-lidas')
  async marcarTodasComoLidas(@Request() req: any): Promise<{ success: boolean }> {
    const organizationId = req.user.organizationId;
    return this.notificacoesService.marcarTodasComoLidas(organizationId);
  }
}