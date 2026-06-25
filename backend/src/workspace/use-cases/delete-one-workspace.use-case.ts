import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DeleteOneWorkspaceUseCase } from '../classes/delete-one-workspace.class';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { Board } from '../entities/board.entity';
import { TaskList } from 'src/task-list/entities/task-list.entity';
import { Task } from 'src/task/entities/task.entity';

@Injectable()
export class DeleteOneWorkspaceUseCaseImp extends DeleteOneWorkspaceUseCase {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }
  async execute(workspace: Workspace, deletedBy: AuthenticatedUserDto): Promise<boolean> {
    // Proceso de eliminación
    await this.workspaceRepository.manager.transaction(async (manager) => {
      // Dehabilitar el workspace
      await manager.update(Workspace, { id: workspace.id }, { isAvailable: false });

      // Dehabilitar todos los members
      await manager.update(WorkspaceMember, { workspace: { id: workspace.id } }, { isAvailable: false });

      //  Buscar los boards asociados
      const boards = await manager.find(Board, { where: { workspace: { id: workspace.id } } });
      const boardsId = boards.map((board) => board.id);

      if (boards.length > 0) {
        // Dehabilitar todos los boards
        await manager.update(Board, { workspace: { id: workspace.id } }, { isAvailable: false });

        // Buscar las lista de tareas dentro de los boards
        const taskLists = await manager.find(TaskList, { where: { board: { id: In(boardsId) } } });
        const taskListsId = taskLists.map((taskList) => taskList.id);

        if (taskLists.length > 0) {
          // Dehabilitar todos los task lists
          await manager.update(TaskList, { board: { id: In(boardsId) } }, { isAvailable: false });

          // Dehabilitar todas las tareas
          await manager.update(Task, { taskList: { id: In(taskListsId) } }, { isAvailable: false });
        }
      }
    });

    return true;
  }
}
