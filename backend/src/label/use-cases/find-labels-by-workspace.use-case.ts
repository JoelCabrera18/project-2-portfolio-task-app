import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label } from '../entities/label.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { FindLabelsByWorkspaceUseCase } from '../classes/find-labels-by-workspace.class';

@Injectable()
export class FindLabelsByWorkspaceUseCaseImp implements FindLabelsByWorkspaceUseCase {
  constructor(
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async execute(workspaceCode: string): Promise<Label[]> {
    const workspace = await this.workspaceRepository.findOneBy({ code: workspaceCode });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return this.labelRepository.find({
      where: { workspace: { id: workspace.id }, isAvailable: true },
      order: { name: 'ASC' },
    });
  }
}
