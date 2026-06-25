import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ type: 'string', description: 'Código del usuario', example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  userCode: string;

  @ApiProperty({ type: 'string', description: 'Código del perfil', example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  profileCode: string;
}
