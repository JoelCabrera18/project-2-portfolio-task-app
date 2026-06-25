import { IUserCredential } from 'src/auth/interfaces/user-credential.interface';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { EntityType } from '../enums/entity-type.enum';
import { WorkspaceAction } from '../enums/workspace-action.enum';

export interface LogWorkspaceInterface {
  user: IUserCredential;
  workspace: Workspace;
  entityType: EntityType;
  action: WorkspaceAction;
  title: string;
  entityCode: string;
  metadata: Record<string, unknown>;
}
