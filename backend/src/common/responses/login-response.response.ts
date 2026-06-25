import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user-response.response';

export class loginResponse {
  @ApiProperty({
    type: 'string',
    description: 'Token de autenticación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    type: 'string',
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({ type: UserResponse, description: 'Usuario autenticado' })
  user: UserResponse;
}
