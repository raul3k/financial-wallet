import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'strongPassword123',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
