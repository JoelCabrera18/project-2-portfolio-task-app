import { Workspace } from 'src/workspace/entities/workspace.entity';
import { SendInvitationToJoinToWorkspaceDto } from '../dto/send-invitation-to-join-to-workspace.dto';
import { WorkspaceInvitation } from '../entities/workspace-invitation.entity';

export abstract class SendInvitationToJoinToWorkspaceUseCase {
  abstract execute(workspace: Workspace, dto: SendInvitationToJoinToWorkspaceDto): Promise<WorkspaceInvitation>;
}
