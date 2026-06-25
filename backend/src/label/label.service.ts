import { Injectable } from '@nestjs/common';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { CreateLabelUseCase } from './classes/create-label.class';
import { FindLabelsByWorkspaceUseCase } from './classes/find-labels-by-workspace.class';
import { UpdateLabelUseCase } from './classes/update-label.class';
import { DeleteLabelUseCase } from './classes/delete-label.class';
import { LabelResponse } from 'src/common/responses';

@Injectable()
export class LabelService {
  constructor(
    private readonly createLabelUseCase: CreateLabelUseCase,
    private readonly findLabelsByWorkspaceUseCase: FindLabelsByWorkspaceUseCase,
    private readonly updateLabelUseCase: UpdateLabelUseCase,
    private readonly deleteLabelUseCase: DeleteLabelUseCase,
  ) {}

  async create(dto: CreateLabelDto): Promise<LabelResponse> {
    const label = await this.createLabelUseCase.execute(dto);
    return { id: label.id, code: label.code, name: label.name, color: label.color };
  }

  async findByWorkspace(workspaceCode: string): Promise<LabelResponse[]> {
    const labels = await this.findLabelsByWorkspaceUseCase.execute(workspaceCode);
    return labels.map((l) => ({ id: l.id, code: l.code, name: l.name, color: l.color }));
  }

  async update(id: number, dto: UpdateLabelDto): Promise<LabelResponse> {
    const label = await this.updateLabelUseCase.execute(id, dto);
    return { id: label.id, code: label.code, name: label.name, color: label.color };
  }

  async remove(id: number): Promise<LabelResponse> {
    const label = await this.deleteLabelUseCase.execute(id);
    return { id: label.id, code: label.code, name: label.name, color: label.color };
  }
}
