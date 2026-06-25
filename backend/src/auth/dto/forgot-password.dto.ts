import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario para restablecer la contraseña',
  })
  email: string;
}
