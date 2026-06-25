import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { LabelService } from './label.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LabelResponse } from 'src/common/responses';
import { AuthGuard } from '@nestjs/passport';
import { WorkspaceRoles } from 'src/auth/decorators/workspace-roles.decorator';
import { WorkspaceRoleGuard } from 'src/auth/guards/workspace-role.guard';

@Controller('label')
@UseGuards(AuthGuard('jwt'))
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('owner', 'member')
  @ApiOperation({ summary: 'Crear una etiqueta en el workspace' })
  @ApiResponse({ status: 201, description: 'Etiqueta creada exitosamente', type: LabelResponse })
  create(@Body() dto: CreateLabelDto) {
    return this.labelService.create(dto);
  }

  @Get('workspace/:workspaceCode')
  @ApiOperation({ summary: 'Obtener todas las etiquetas de un workspace' })
  @ApiResponse({ status: 200, description: 'Lista de etiquetas', type: [LabelResponse] })
  findByWorkspace(@Param('workspaceCode') workspaceCode: string) {
    return this.labelService.findByWorkspace(workspaceCode);
  }

  @Patch(':id')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('owner', 'member')
  @ApiOperation({ summary: 'Actualizar una etiqueta' })
  @ApiResponse({ status: 200, description: 'Etiqueta actualizada exitosamente', type: LabelResponse })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.labelService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles('owner')
  @ApiOperation({ summary: 'Eliminar una etiqueta (soft delete)' })
  @ApiQuery({ name: 'ws', required: true, description: 'Workspace code' })
  @ApiResponse({ status: 200, description: 'Etiqueta eliminada exitosamente', type: LabelResponse })
  remove(@Query('ws') workspaceCode: string, @Param('id', ParseIntPipe) id: number) {
    return this.labelService.remove(id);
  }
}
