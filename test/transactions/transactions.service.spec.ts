import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../../src/transactions/services/transactions.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoggingService } from '../../src/logging/services/logging.service';
import { WalletsService } from '../../src/wallet/services/wallets.service';
import { Transaction, TransactionStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaServiceMock: jest.Mocked<PrismaService>;
  let loggingServiceMock: jest.Mocked<LoggingService>;
  let walletsServiceMock: jest.Mocked<WalletsService>;

  beforeEach(async () => {
    prismaServiceMock = {
      wallet: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    loggingServiceMock = {
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<LoggingService>;

    walletsServiceMock = {
      updateWalletBalance: jest.fn(),
    } as unknown as jest.Mocked<WalletsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
        { provide: WalletsService, useValue: walletsServiceMock },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('createTransaction', () => {
    it('should revert the transaction if any error occurs during wallet update', async () => {
      const mockTransaction: Transaction = {
        id: 'transaction-id-123',
        senderWalletId: 'sender-id',
        receiverWalletId: 'receiver-id',
        amount: 100,
        status: TransactionStatus.pending,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createTransactionDto = {
        senderWalletId: mockTransaction.senderWalletId,
        receiverWalletId: mockTransaction.receiverWalletId,
        amount: mockTransaction.amount,
      };

      (prismaServiceMock.transaction.create as jest.Mock).mockResolvedValue(
        mockTransaction,
      );

      (prismaServiceMock.wallet.findUnique as jest.Mock)
        .mockResolvedValueOnce({ balance: 200 })
        .mockResolvedValueOnce({ balance: 100 });

      (walletsServiceMock.deposit as jest.Mock).mockRejectedValue(
        new Error('Failed to update receiver wallet'),
      );

      await expect(
        service.createTransaction(createTransactionDto),
      ).rejects.toThrow(BadRequestException);

      // Verifica se o método error foi chamado
      expect(loggingServiceMock.error).toHaveBeenCalled();

      // Verifica se o primeiro argumento da primeira chamada corresponde à mensagem esperada
      const [firstArg] = loggingServiceMock.error.mock.calls[0];
      expect(firstArg).toBe(
        `Transaction ${mockTransaction.id} failed: Failed to update receiver wallet`,
      );
    });
  });
});
