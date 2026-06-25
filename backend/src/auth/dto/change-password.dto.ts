import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @ApiProperty({ example: 'currentPass123' })
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: 'newPass12345', minLength: 8 })
  newPassword: string;
}
