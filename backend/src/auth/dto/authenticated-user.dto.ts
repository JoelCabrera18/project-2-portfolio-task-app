export class AuthenticatedUserDto {
  id: number;
  code: string;

  private constructor(id: number, code: string) {
    this.id = id;
    this.code = code;
  }

  static fromUserProfile(id: number, code: string) {
    return new AuthenticatedUserDto(id, code);
  }
}
