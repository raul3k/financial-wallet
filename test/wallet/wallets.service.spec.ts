// test/wallet/wallets.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from '../../src/wallet/services/wallets.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoggingService } from '../../src/logging/services/logging.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WalletsService', () => {
  let walletsService: WalletsService;
  let loggingService: LoggingService;

  // Mock do PrismaService
  const prismaServiceMock = {
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  // Mock do LoggingService
  const loggingServiceMock = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
    }).compile();

    walletsService = module.get<WalletsService>(WalletsService);
    loggingService = module.get<LoggingService>(LoggingService);
  });

  describe('getWalletBalance', () => {
    it('should return the balance of the wallet if it exists', async () => {
      const userId = 'user-id-123';
      const balance = 100;

      // Mockando a resposta do banco de dados
      prismaServiceMock.wallet.findUnique.mockResolvedValue({ balance });

      const result = await walletsService.getBalance(userId);

      expect(result).toBe(balance);
      expect(loggingService.log).toHaveBeenCalledWith(
        `Balance retrieved for wallet with user ID: ${userId}`,
      );
    });

    it('should throw NotFoundException if the wallet does not exist', async () => {
      const userId = 'user-id-123';

      // Simulando que o banco não retornou a carteira
      prismaServiceMock.wallet.findUnique.mockResolvedValue(null);

      await expect(walletsService.getBalance(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateWalletBalance', () => {
    it('should update the balance if sufficient funds exist', async () => {
      const userId = 'user-id-123';
      const updateBalanceDto = { amount: 50 };
      const currentBalance = 100;
      const updatedBalance = 150;

      // Mockando a resposta do banco de dados
      prismaServiceMock.wallet.findUnique.mockResolvedValue({
        balance: currentBalance,
      });
      prismaServiceMock.wallet.update.mockResolvedValue({
        balance: updatedBalance,
      });

      const result = await walletsService.deposit(
        userId,
        updateBalanceDto,
      );

      expect(result.balance).toBe(updatedBalance);
      expect(loggingService.log).toHaveBeenCalledWith(
        `Balance updated for wallet with user ID: ${userId}. New balance: ${updatedBalance}`,
      );
    });

    it('should throw BadRequestException if there are insufficient funds', async () => {
      const userId = 'user-id-123';
      const updateBalanceDto = { amount: -200 }; // Tentativa de subtrair mais do que o saldo atual
      const currentBalance = 100;

      prismaServiceMock.wallet.findUnique.mockResolvedValue({
        balance: currentBalance,
      });

      await expect(
        walletsService.deposit(userId, updateBalanceDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if the wallet does not exist', async () => {
      const userId = 'user-id-123';
      const updateBalanceDto = { amount: 50 };

      // Simulando que o banco não retornou a carteira
      prismaServiceMock.wallet.findUnique.mockResolvedValue(null);

      await expect(
        walletsService.deposit(userId, updateBalanceDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
