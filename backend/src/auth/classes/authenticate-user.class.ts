import { UserProfile } from '../entities/auth.entity';
import { loginResponse } from '../interfaces/login-response.interface';

export abstract class AuthenticateUserUseCase {
  abstract execute(user: UserProfile, rawPassword: string): Promise<loginResponse>;
}
