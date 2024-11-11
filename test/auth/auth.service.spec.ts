// test/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoggingService } from '../../src/logging/services/logging.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaServiceMock: any;
  let jwtServiceMock: any;
  let loggingServiceMock: any;

  const mockUser = {
    id: 'user-id-123',
    username: 'testuser',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    // Mocking PrismaService
    prismaServiceMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    // Mocking JwtService
    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    // Mocking LoggingService
    loggingServiceMock = {
      logUserRegistration: jest.fn(),
      logUserLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = { username: 'testuser', password: 'password123' };

      prismaServiceMock.user.findUnique.mockResolvedValue(null); // No existing user
      prismaServiceMock.user.create.mockResolvedValue(mockUser);

      const result = await authService.register(registerDto);

      expect(result).toEqual({ message: 'User registered successfully' });
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: registerDto.username },
      });
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: { username: registerDto.username, password: expect.any(String) },
      });
      expect(loggingServiceMock.logUserRegistration).toHaveBeenCalledWith(
        mockUser,
      );
    });

    it('should throw BadRequestException if username already exists', async () => {
      const registerDto = { username: 'testuser', password: 'password123' };

      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser); // Simulate existing user

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should successfully login and return a JWT token', async () => {
      const loginDto = { username: 'testuser', password: 'password123' };

      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); // Simulating password match

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); // Simulating password mismatch

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto = { username: 'nonexistentuser', password: 'password123' };

      prismaServiceMock.user.findUnique.mockResolvedValue(null); // Simulating non-existent user

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
