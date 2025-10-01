import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizacoesService } from './organizacoes.service';
import { UpdateOrganizacaoDto } from './dto/update-organizacao.dto';

@ApiTags('Organizações')
@Controller('organizacoes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class OrganizacoesController {
  constructor(private readonly organizacoesService: OrganizacoesService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados da organização' })
  @ApiResponse({
    status: 200,
    description: 'Organização atualizada com sucesso',
  })
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados da organização' })
  @ApiResponse({
    status: 200,
    description: 'Organização atualizada com sucesso',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizacaoDto: UpdateOrganizacaoDto,
  ) {
    return this.organizacoesService.update(id, updateOrganizacaoDto);
  }
}