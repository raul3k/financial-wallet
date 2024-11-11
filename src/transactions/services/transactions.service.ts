import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from '../../logging/services/logging.service';
import { WalletsService } from '../../wallet/services/wallets.service';
import { TransactionStatus } from '@prisma/client';
import { RegisterTransactionDto } from '../dto/register-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
    @Inject(forwardRef(() => WalletsService))
    private readonly walletsService: WalletsService,
  ) {}

  async listUserTransactions(userId: string) {
    const wallet = await this.walletsService.getWalletByUserId(userId);
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }],
      },
    });

    if (!transactions) {
      throw new NotFoundException('No transactions found.');
    }

    return transactions;
  }

  async register(registerTransactionDto: RegisterTransactionDto) {
    const { senderWalletId, receiverWalletId, amount } = registerTransactionDto;

    return this.prisma.transaction.create({
      data: {
        senderWalletId,
        receiverWalletId,
        amount,
        status: TransactionStatus.completed,
      },
    });
  }

  async reverseTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    if (transaction.status !== TransactionStatus.completed) {
      throw new BadRequestException(
        'Only completed transactions can be reversed',
      );
    }

    if (transaction.senderWalletId === transaction.receiverWalletId) {
      throw new BadRequestException(
        'Can only reverse when the transaction is from transfer to another user.',
      );
    }

    const [senderWallet, receiverWallet] = await Promise.all([
      this.prisma.wallet.findUnique({
        where: { id: transaction.senderWalletId },
      }),
      this.prisma.wallet.findUnique({
        where: { id: transaction.receiverWalletId },
      }),
    ]);

    await this.walletsService.deposit(senderWallet.userId, {
      amount: transaction.amount,
    });
    await this.walletsService.withdraw(receiverWallet.userId, {
      amount: transaction.amount,
    });

    const reversedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.reversed },
    });

    this.loggingService.log(
      `Transaction ${transaction.id} reversed successfully: ${transaction.amount} refunded from wallet ${transaction.receiverWalletId} to wallet ${transaction.senderWalletId}`,
    );

    return reversedTransaction;
  }
}
