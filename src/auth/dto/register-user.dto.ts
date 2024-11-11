import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'Password for the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
