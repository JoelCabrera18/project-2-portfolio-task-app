import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { AddMemberToWorkspaceDto } from '../dto/add-member-to.workspace.dto';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { Workspace } from '../entities/workspace.entity';

export abstract class AddMemberToWorkspaceUseCase {
  abstract execute(
    dto: AddMemberToWorkspaceDto,
    user: AuthenticatedUserDto,
    workspace: Workspace,
  ): Promise<WorkspaceMember>;
}
