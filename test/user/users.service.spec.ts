import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/user/services/users.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoggingService } from '../../src/logging/services/logging.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;
  let loggingService: LoggingService;

  // Mocking dependencies
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockLoggingService = {
    logUserRegistration: jest.fn(),
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggingService, useValue: mockLoggingService },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    loggingService = module.get<LoggingService>(LoggingService);
  });

  describe('createUser', () => {
    it('should throw ConflictException if username already exists', async () => {
      // Mock Prisma to return an existing user
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: '1',
        username: 'existingUser',
        password: 'hashedPassword',
      });

      const createUserDto = {
        username: 'existingUser',
        password: 'password123',
      };

      await expect(usersService.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a user and return the user object', async () => {
      // Mock Prisma to return a new user
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // Simulating no user found
      mockPrismaService.user.create.mockResolvedValueOnce({
        id: '1',
        username: 'newUser',
        password: 'hashedPassword',
      });

      const createUserDto = { username: 'newUser', password: 'password123' };

      const user = await usersService.createUser(createUserDto);

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username', 'newUser');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'newUser',
          password: expect.any(String), // The hashed password should be passed
          wallet: { create: { balance: 0 } },
        },
      });
      expect(loggingService.logUserRegistration).toHaveBeenCalledWith({
        id: '1',
        username: 'newUser',
      });
    });
  });

  describe('getUserById', () => {
    it('should throw BadRequestException if user not found', async () => {
      // Mock Prisma to return null (user not found)
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(usersService.getUserById('nonExistentId')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return user with wallet if user is found', async () => {
      // Mock Prisma to return a user
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: '1',
        username: 'existingUser',
        wallet: { balance: 0 },
      });

      const user = await usersService.getUserById('1');

      expect(user).toHaveProperty('id', '1');
      expect(user).toHaveProperty('username', 'existingUser');
      expect(user).toHaveProperty('wallet');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { wallet: true },
      });
      expect(loggingService.log).toHaveBeenCalledWith('Retrieved user: 1');
    });
  });
});
