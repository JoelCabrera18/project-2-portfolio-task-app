import { Workspace } from '../entities/workspace.entity';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';

export abstract class DeleteOneWorkspaceUseCase {
  abstract execute(workspace: Workspace, user: AuthenticatedUserDto): Promise<boolean>;
}
