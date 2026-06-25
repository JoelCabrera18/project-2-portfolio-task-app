import { UserResponse } from './user-response.interface';

export interface loginResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}
