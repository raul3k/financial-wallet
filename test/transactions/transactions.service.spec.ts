import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../../src/transactions/services/transactions.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoggingService } from '../../src/logging/services/logging.service';
import { WalletsService } from '../../src/wallet/services/wallets.service';
import { Transaction, TransactionStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaServiceMock: jest.Mocked<any>;
  let loggingServiceMock: jest.Mocked<any>;
  let walletsServiceMock: jest.Mocked<any>;

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
    };

    loggingServiceMock = {
      log: jest.fn(),
      error: jest.fn(),
    };

    walletsServiceMock = {
      updateWalletBalance: jest.fn(),
      deposit: jest.fn(),
      withdraw: jest.fn(),
    };

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

  describe('register', () => {
    it('should create a new transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'transaction-id-123',
        senderWalletId: 'sender-id',
        receiverWalletId: 'receiver-id',
        amount: 100,
        status: TransactionStatus.completed,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const registerTransactionDto = {
        senderWalletId: mockTransaction.senderWalletId,
        receiverWalletId: mockTransaction.receiverWalletId,
        amount: mockTransaction.amount,
      };

      prismaServiceMock.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.register(registerTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(prismaServiceMock.transaction.create).toHaveBeenCalledWith({
        data: {
          senderWalletId: registerTransactionDto.senderWalletId,
          receiverWalletId: registerTransactionDto.receiverWalletId,
          amount: registerTransactionDto.amount,
          status: TransactionStatus.completed,
        },
      });
    });
  });

  describe('reverseTransaction', () => {
    it('should reverse a transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'transaction-id-123',
        senderWalletId: 'sender-id',
        receiverWalletId: 'receiver-id',
        amount: 100,
        status: TransactionStatus.completed,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSenderWallet = {
        id: 'sender-id',
        userId: 'sender-user-id',
        balance: 0,
      };

      const mockReceiverWallet = {
        id: 'receiver-id',
        userId: 'receiver-user-id',
        balance: 100,
      };

      prismaServiceMock.transaction.findUnique.mockResolvedValue(mockTransaction);
      prismaServiceMock.wallet.findUnique
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockReceiverWallet);
      prismaServiceMock.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.reversed,
      });

      walletsServiceMock.deposit.mockResolvedValue({});
      walletsServiceMock.withdraw.mockResolvedValue({});

      const result = await service.reverseTransaction(mockTransaction.id);

      expect(result.status).toBe(TransactionStatus.reversed);
      expect(walletsServiceMock.deposit).toHaveBeenCalledWith('sender-user-id', {
        amount: mockTransaction.amount,
      });
      expect(walletsServiceMock.withdraw).toHaveBeenCalledWith('receiver-user-id', {
        amount: mockTransaction.amount,
      });
      expect(loggingServiceMock.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to reverse a transaction between same wallet', async () => {
      const mockTransaction: Transaction = {
        id: 'transaction-id-123',
        senderWalletId: 'same-id',
        receiverWalletId: 'same-id',
        amount: 100,
        status: TransactionStatus.completed,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaServiceMock.transaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(service.reverseTransaction(mockTransaction.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});