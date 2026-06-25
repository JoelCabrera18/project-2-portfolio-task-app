import { ChangePasswordDto } from '../dto/change-password.dto';

export abstract class ChangePasswordUseCase {
  abstract execute(userCode: string, dto: ChangePasswordDto): Promise<void>;
}
