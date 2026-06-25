import { MyProfileResponse } from '../interfaces/my-profile-response.interface';

export abstract class GetMyProfileUseCase {
  abstract execute(userCode: string): Promise<MyProfileResponse>;
}
