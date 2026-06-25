import { UpdateProfileDto } from '../dto/update-profile.dto';
import { MyProfileResponse } from '../interfaces/my-profile-response.interface';

export abstract class UpdateMyProfileUseCase {
  abstract execute(userCode: string, dto: UpdateProfileDto): Promise<MyProfileResponse>;
}
