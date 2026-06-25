export interface RegisterProfileResponse {
  user: {
    userCode: string;
    profileCode: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  token: string;
  refreshToken: string;
}
