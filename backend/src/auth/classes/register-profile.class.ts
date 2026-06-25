import { CreateProfileDto } from '../dto/create-profile.dto';
import { RegisterProfileResponse } from '../interfaces/register-profile-response.interface';

export abstract class RegisterProfileUseCase {
  abstract execute(profile: CreateProfileDto): Promise<RegisterProfileResponse>;
}
