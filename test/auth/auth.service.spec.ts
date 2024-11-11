import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoggingService } from '../../src/logging/services/logging.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { WalletsService } from '../../src/wallet/services/wallets.service';
import { UsersService } from '../../src/user/services/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaServiceMock: jest.Mocked<any>;
  let jwtServiceMock: jest.Mocked<any>;
  let loggingServiceMock: jest.Mocked<any>;
  let walletsServiceMock: jest.Mocked<any>;
  let usersServiceMock: jest.Mocked<any>;

  const mockUser = {
    id: 'user-id-123',
    username: 'testuser',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    prismaServiceMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    loggingServiceMock = {
      logUserRegistration: jest.fn(),
      logUserLogin: jest.fn(),
      error: jest.fn(),
    };

    walletsServiceMock = {
      createWallet: jest.fn(),
    };

    usersServiceMock = {
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
        { provide: WalletsService, useValue: walletsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = { username: 'testuser', password: 'password123' };

      usersServiceMock.createUser.mockResolvedValue(mockUser);
      walletsServiceMock.createWallet.mockResolvedValue({
        id: 'wallet-id',
        userId: mockUser.id,
        balance: 0,
      });

      const result = await authService.register(registerDto);

      expect(result).toEqual({ message: 'User registered successfully' });
      expect(usersServiceMock.createUser).toHaveBeenCalledWith(registerDto);
      expect(walletsServiceMock.createWallet).toHaveBeenCalledWith(mockUser.id);
      expect(loggingServiceMock.logUserRegistration).toHaveBeenCalledWith(
        mockUser,
      );
    });

    it('should throw BadRequestException if registration fails', async () => {
      const registerDto = { username: 'testuser', password: 'password123' };

      usersServiceMock.createUser.mockRejectedValue(
        new Error('Registration failed'),
      );

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(loggingServiceMock.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login and return a JWT token', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };

      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ accessToken: 'fake-jwt-token' });
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: loginDto.username },
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
      expect(loggingServiceMock.logUserLogin).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };

      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto = { username: 'nonexistentuser', password: 'password123' };

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
