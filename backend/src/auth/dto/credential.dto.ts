import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CredentialDto {
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @ApiProperty({
    example: 'joel.cabrera.parrales',
    description: 'Nombre de usuario del usuario',
    minLength: 3,
    maxLength: 50,
  })
  username: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @ApiProperty({
    example: '1234567890',
    description: 'Contraseña del usuario',
    minLength: 3,
    maxLength: 50,
  })
  password: string;
}
