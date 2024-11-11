import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({
    description: 'Username who will receive the amount',
  })
  @IsNotEmpty()
  @IsString()
  username: string;
  @ApiProperty({
    description: 'Amount to be added to the wallet balance',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
