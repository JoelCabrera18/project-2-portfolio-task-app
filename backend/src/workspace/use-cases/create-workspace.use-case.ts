import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { Workspace } from '../entities/workspace.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateWorkspaceUseCase } from '../classes/create-workspace.class';
import { EntityType } from 'src/common/enums/entity-type.enum';
import { Board } from '../entities/board.entity';
import { TaskList } from '../../task-list/entities/task-list.entity';
import { CreateWorkspaceHistoryUseCase } from '../classes/create-workspace-history.class';

@Injectable()
export class CreateWorkspaceUseCaseImp implements CreateWorkspaceUseCase {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
    private readonly workspaceHistory: CreateWorkspaceHistoryUseCase,
    private readonly authService: AuthService,
  ) {}
  async execute(createWorkspaceDto: CreateWorkspaceDto, createdBy: AuthenticatedUserDto): Promise<Workspace> {
    // TODO: Utilizar una transaccion para guardar los datos del workspace y los tableros
    const { title, description, color } = createWorkspaceDto;
    const user = await this.authService.isValidUser(createdBy.code);

    const workspace = this.workspaceRepository.create({
      title,
      description,
      color,
      workspaceMembers: [{ user, roleMember: 'owner' }],
      user,
    });
    await this.workspaceRepository.save(workspace);

    const boards = this.boardRepository.create([{ workspace }]);
    await this.boardRepository.save(boards);
    workspace.boards = boards;

    await this.workspaceHistory.created(user, workspace, workspace.code, EntityType.WORKSPACE);
    await this.workspaceHistory.created(user, workspace, workspace.boards[0].code, EntityType.BOARD);
    return workspace;
  }
}
