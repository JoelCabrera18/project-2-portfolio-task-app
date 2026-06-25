import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsDate, IsArray, IsEmail, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    minLength: 3,
    maxLength: 50,
  })
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Perez',
    description: 'Primer apellido del usuario',
    minLength: 3,
    maxLength: 50,
  })
  secondName?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Perez',
    description: 'Primer apellido del usuario',
    minLength: 3,
    maxLength: 50,
  })
  firstSurname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Perez',
    description: 'Segundo apellido del usuario',
    minLength: 3,
    maxLength: 50,
  })
  secondSurname?: string;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    example: '1990-01-01',
    description: 'Fecha de nacimiento del usuario',
  })
  dateBirth: Date;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'joel.cabrera.parrales@mail.com',
    description: 'Correo electrónico del usuario',
  })
  email: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    example: ['1234567890'],
    description: 'Teléfonos del usuario',
  })
  phone: string[];

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'joel.cabrera.parrales@mail.com',
    description: 'Nombre de usuario del usuario',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({
    example: '1234567890',
    description: 'Contraseña del usuario',
    minLength: 3,
    maxLength: 50,
  })
  password: string;
}
