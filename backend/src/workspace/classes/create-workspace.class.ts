import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { Workspace } from '../entities/workspace.entity';

export abstract class CreateWorkspaceUseCase {
  abstract execute(createWorkspaceDto: CreateWorkspaceDto, createdBy: AuthenticatedUserDto): Promise<Workspace>;
}
