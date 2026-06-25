import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponse {
  @ApiProperty({ type: 'string', description: 'Código del usuario', example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  userCode: string;

  @ApiProperty({ type: 'string', description: 'Código del perfil', example: 'a750d349-4f01-4e56-a547-44b25e271d67' })
  profileCode: string;

  @ApiProperty({ type: 'string', description: 'Nombre del perfil', example: 'Joel Cabrera' })
  name: string;

  @ApiProperty({ type: 'string', description: 'Correo del perfil', example: 'joel@mail.com' })
  email: string;

  @ApiProperty({ type: 'string', description: 'Fecha de creación del perfil', example: '2022-01-01T00:00:00.000Z' })
  createdAt: Date;
}
