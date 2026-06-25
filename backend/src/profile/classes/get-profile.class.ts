import { ProfileResponse } from '../interfaces/profile-response.interface';

export abstract class GetProfileUseCase {
  abstract execute(code: string): Promise<ProfileResponse>;
}
