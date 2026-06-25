import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';

export abstract class RemoveMemberUseCase {
  abstract execute(workspaceId: number, memberId: number, user: AuthenticatedUserDto): Promise<void>;
}
