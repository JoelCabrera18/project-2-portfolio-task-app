import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { IWorkspace } from '../interfaces/workspace-response.interface';

export abstract class FindAllWorkspacesUseCase {
  abstract execute(user: AuthenticatedUserDto): Promise<IWorkspace[]>;
}
