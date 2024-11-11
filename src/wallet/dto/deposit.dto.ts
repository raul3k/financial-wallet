import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to be added to the wallet balance',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
