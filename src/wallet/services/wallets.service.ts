import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from '../../logging/services/logging.service';
import { DepositDto } from '../dto/deposit.dto';
import { WithdrawDto } from '../dto/withdraw.dto';
import { TransferDto } from '../dto/transfer.dto';
import { TransactionsService } from '../../transactions/services/transactions.service';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionService: TransactionsService,
  ) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    this.loggingService.log(
      `Balance retrieved for wallet with user ID: ${userId}`,
    );
    return wallet.balance;
  }

  async getWallet(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getWalletByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('Target user not found');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      throw new NotFoundException('Target wallet not found');
    }

    return wallet;
  }

  async getWalletByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    if (withdrawDto.amount <= 0) {
      throw new BadRequestException('Cannot withdraw 0 or negative value');
    }

    const wallet = await this.getWalletByUserId(userId);

    const updatedBalance = wallet.balance - withdrawDto.amount;
    if (updatedBalance < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { userId },
      data: { balance: updatedBalance },
    });

    this.loggingService.log(
      `Balance updated for wallet with user ID: ${userId}. New balance: ${updatedWallet.balance}`,
    );
    return updatedWallet;
  }

  async deposit(userId: string, depositDto: DepositDto) {
    if (depositDto.amount <= 0) {
      throw new BadRequestException('Cannot deposit 0 or less.');
    }

    const wallet = await this.getWalletByUserId(userId);

    const updatedBalance = wallet.balance + depositDto.amount;
    if (updatedBalance < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { userId },
      data: { balance: updatedBalance },
    });

    this.loggingService.log(
      `Balance updated for wallet with user ID: ${userId}. New balance: ${updatedWallet.balance}`,
    );

    await this.transactionService.register({
      senderWalletId: wallet.id,
      receiverWalletId: wallet.id,
      amount: depositDto.amount,
    });

    return updatedWallet;
  }

  async transfer(userId: string, transferDto: TransferDto) {
    if (transferDto.amount <= 0) {
      throw new BadRequestException('Cannot transfer 0 or less.');
    }

    const wallet = await this.getWalletByUserId(userId);

    const updatedBalance = wallet.balance - transferDto.amount;
    if (updatedBalance < 0) {
      throw new BadRequestException('Insufficient funds');
    }

    const targetWallet = await this.getWalletByUsername(transferDto.username);
    const updatedTargetWalletBalance =
      targetWallet.balance + transferDto.amount;

    const updatedFromWallet = await this.prisma.wallet.update({
      where: { userId },
      data: { balance: updatedBalance },
    });

    await this.prisma.wallet.update({
      where: { userId: targetWallet.userId },
      data: { balance: updatedTargetWalletBalance },
    });

    this.loggingService.log(
      `Balance updated for wallet with user ID: ${userId}. New balance: ${updatedFromWallet.balance}`,
    );

    this.loggingService.log(
      `Transferred funds from wallet with user ID: ${userId} to wallet ${targetWallet.userId}`,
    );

    await this.transactionService.register({
      senderWalletId: wallet.id,
      receiverWalletId: targetWallet.id,
      amount: transferDto.amount,
    });

    return updatedFromWallet;
  }

  async createWallet(userId: string) {
    const existingWallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (existingWallet) {
      return existingWallet;
    }

    try {
      const wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
      });
      this.loggingService.log(`Wallet created for user ID: ${userId}`);
      return wallet;
    } catch (error) {
      this.loggingService.error('Error creating wallet:', error);
      throw new BadRequestException('Error creating wallet');
    }
  }
}
