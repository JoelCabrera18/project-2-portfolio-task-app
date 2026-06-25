import { ApiProperty } from '@nestjs/swagger';
import { ProfileResponse } from './profile.response';

export class ProfileCreatedResponse {
  @ApiProperty({ type: ProfileResponse, description: 'Perfil creado' })
  user: ProfileResponse;

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
}
