import { IsNotEmpty, IsUUID, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTransactionDto {
  @ApiProperty({
    description: 'Sender wallet ID',
    example: 'uuid-sender-wallet',
  })
  @IsUUID()
  @IsNotEmpty()
  senderWalletId: string;

  @ApiProperty({
    description: 'Receiver wallet ID',
    example: 'uuid-receiver-wallet',
  })
  @IsUUID()
  @IsNotEmpty()
  receiverWalletId: string;

  @ApiProperty({ description: 'Transaction amount', example: 100.0 })
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
