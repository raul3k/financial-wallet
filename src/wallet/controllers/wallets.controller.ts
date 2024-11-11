import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { WalletsService } from '../services/wallets.service';
import { DepositDto } from '../dto/deposit.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoggingService } from '../../logging/services/logging.service';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransferDto } from '../dto/transfer.dto';

@ApiTags('Wallets')
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletsController {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly walletsService: WalletsService,
  ) {}

  @Get('balance')
  @ApiResponse({
    status: 200,
    description: 'Wallet balance retrieved successfully.',
  })
  async getBalance(@Request() req: any) {
    this.loggingService.log('User id', req.user.userId);
    return this.walletsService.getBalance(req.user.userId);
  }

  @Patch('deposit')
  @ApiResponse({
    status: 200,
    description: 'Add funds to the wallet',
  })
  async deposit(@Request() req: any, @Body() depositDto: DepositDto) {
    return this.walletsService.deposit(req.user.userId, depositDto);
  }

  @Patch('withdraw')
  @ApiResponse({
    status: 200,
    description: 'Withdraw funds from the wallet',
  })
  async withdraw(@Request() req: any, @Body() withdrawDto: WithdrawDto) {
    return this.walletsService.withdraw(req.user.userId, withdrawDto);
  }

  @Post('transfer')
  @ApiResponse({
    status: 200,
    description: 'Transfer funds from the wallet to another user',
  })
  async transfer(@Request() req: any, @Body() transferDto: TransferDto) {
    return this.walletsService.transfer(req.user.userId, transferDto);
  }
}
