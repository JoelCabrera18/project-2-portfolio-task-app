import { InjectRepository } from '@nestjs/typeorm';
import { LogWorkspaceInterface } from 'src/common/interfaces/log-workspace.interface';
import { Repository } from 'typeorm';
import { WorkspaceHistory } from '../entities/workspace-history.entity';
import { CreateWorkspaceHistoryUseCase } from 'src/workspace/classes/create-workspace-history.class';
import { IUserCredential } from 'src/auth/interfaces/user-credential.interface';
import { Workspace } from '../entities/workspace.entity';
import { EntityType } from 'src/common/enums/entity-type.enum';
import { WorkspaceAction } from 'src/common/enums/workspace-action.enum';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CreateWorkspaceHistoryUseCaseImp extends CreateWorkspaceHistoryUseCase {
  constructor(
    @InjectRepository(WorkspaceHistory)
    private readonly workspaceHistoryRepository: Repository<WorkspaceHistory>,
  ) {
    super();
  }

  protected save(log: LogWorkspaceInterface): Promise<WorkspaceHistory> {
    const history = this.workspaceHistoryRepository.create({
      ...log,
      user: { id: log.user.id },
    });
    return this.workspaceHistoryRepository.save(history);
  }

  buildLog(log: Partial<LogWorkspaceInterface>) {
    const newLog: Partial<LogWorkspaceInterface> = { ...log };

    const { entityType, action } = log;
    if (!entityType) throw new InternalServerErrorException('Entity is required to construct the log');
    if (!action) throw new InternalServerErrorException('Action is required to construct the log');

    switch (action) {
      case WorkspaceAction.CREATED:
        newLog.title = `${entityType} created`;
        newLog.action = WorkspaceAction.CREATED;
        break;
      case WorkspaceAction.UPDATED:
        newLog.title = `${entityType} updated`;
        newLog.action = WorkspaceAction.UPDATED;
        break;
      case WorkspaceAction.DELETED:
        newLog.title = `${entityType} deleted`;
        newLog.action = WorkspaceAction.DELETED;
        break;
      case WorkspaceAction.MEMBER_JOINED:
        newLog.title = `${entityType} member joined`;
        newLog.action = WorkspaceAction.MEMBER_JOINED;
        break;
      case WorkspaceAction.MEMBER_REMOVED:
        newLog.title = `${entityType} member removed`;
        newLog.action = WorkspaceAction.MEMBER_REMOVED;
        break;
      case WorkspaceAction.MEMBER_ROLE_UPDATED:
        newLog.title = `${entityType} member role updated`;
        newLog.action = WorkspaceAction.MEMBER_ROLE_UPDATED;
        break;
      case WorkspaceAction.COLLABORATOR_ASSIGNED:
        newLog.title = `${entityType} collaborator assigned`;
        newLog.action = WorkspaceAction.COLLABORATOR_ASSIGNED;
        break;
      case WorkspaceAction.COLLABORATOR_REMOVED:
        newLog.title = `${entityType} collaborator removed`;
        newLog.action = WorkspaceAction.COLLABORATOR_REMOVED;
        break;
      default:
        newLog.title = `${entityType} ${action}`;
        newLog.action = action;
    }
    return newLog as LogWorkspaceInterface;
  }

  created(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType,
      action: WorkspaceAction.CREATED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  updated(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.UPDATED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  deleted(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.DELETED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  memberJoined(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.MEMBER_JOINED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  memberRemoved(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.MEMBER_REMOVED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  memberRoleUpdated(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.MEMBER_ROLE_UPDATED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  collaboratorAssigned(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.COLLABORATOR_ASSIGNED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  collaboratorRemoved(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.COLLABORATOR_REMOVED,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }

  sendWorkspaceInvitation(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entity: EntityType,
  ): Promise<WorkspaceHistory> {
    const log = this.buildLog({
      user,
      workspace,
      entityType: entity,
      action: WorkspaceAction.SEND_INVITATION_TO_JOIN,
      entityCode,
      metadata: { ...workspace },
    });
    return this.save(log);
  }
}
