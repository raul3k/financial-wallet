import {
  Controller,
  Post,
  Param,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List user transactions',
  })
  async listTransactions(@Request() req: any) {
    return this.transactionsService.listUserTransactions(req.user.userId);
  }

  @Post(':id/reverse')
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    example: 'uuid-transaction-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully reversed.',
  })
  async reverse(@Param('id') transactionId: string) {
    return this.transactionsService.reverseTransaction(transactionId);
  }
}
