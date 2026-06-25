import { Workspace } from '../entities/workspace.entity';

export abstract class SendNewMemberEmailUseCase {
  abstract execute(newMemberCode: string, inviterName: string, workspace: Workspace): Promise<void>;
}
