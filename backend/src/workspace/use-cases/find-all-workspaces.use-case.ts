import { Injectable } from '@nestjs/common';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { FindAllWorkspacesUseCase } from '../classes/find-all-workspaces.class';
import { IWorkspace } from '../interfaces/workspace-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { WorkspaceMapper } from '../mappers/workspace.mapper';

@Injectable()
export class FindAllWorkspacesUseCaseImp extends FindAllWorkspacesUseCase {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {
    super();
  }

  async execute({ id: userId }: AuthenticatedUserDto): Promise<IWorkspace[]> {
    const memberships = await this.workspaceMemberRepository.find({
      where: { user: { id: userId }, isAvailable: true },
      relations: { workspace: true },
    });

    if (memberships.length === 0) return [];

    const workspaceIds = memberships.map((m) => m.workspace.id);

    const workspaces = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.boards', 'board')
      .leftJoinAndSelect('board.taskList', 'taskList')
      .leftJoinAndSelect('taskList.tasks', 'task')
      .leftJoinAndSelect('task.labels', 'taskLabel')
      .leftJoinAndSelect('taskLabel.label', 'label')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .leftJoinAndSelect('assignment.workspaceMember', 'assigneeMember')
      .leftJoinAndSelect('assigneeMember.user', 'assigneeUser')
      .leftJoinAndSelect('assigneeUser.profile', 'assigneeProfile')
      .leftJoinAndSelect('workspace.workspaceMembers', 'member', 'member.isAvailable = :memberAvailable')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where({ id: In(workspaceIds) })
      .andWhere('workspace.isAvailable = :isAvailable', { isAvailable: true })
      .setParameter('memberAvailable', true)
      .orderBy('taskList.position', 'ASC')
      .addOrderBy('task.position', 'ASC')
      .getMany();

    return WorkspaceMapper.toWorkspacesResponse(workspaces, userId);
  }
}
