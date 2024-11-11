import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: 'Amount to be withdraw from the wallet balance',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
