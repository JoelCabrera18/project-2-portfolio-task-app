import { IUserCredential } from 'src/auth/interfaces/user-credential.interface';
import { WorkspaceHistory } from 'src/workspace/entities/workspace-history.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { EntityType } from '../../common/enums/entity-type.enum';
import { LogWorkspaceInterface } from '../../common/interfaces/log-workspace.interface';

export abstract class CreateWorkspaceHistoryUseCase {
  protected abstract save(log: LogWorkspaceInterface): Promise<WorkspaceHistory>;
  abstract created(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract updated(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract deleted(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract memberJoined(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract memberRemoved(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract memberRoleUpdated(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract collaboratorAssigned(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract collaboratorRemoved(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
  abstract sendWorkspaceInvitation(
    user: IUserCredential,
    workspace: Workspace,
    entityCode: string,
    entityType: EntityType,
  ): Promise<WorkspaceHistory>;
}
