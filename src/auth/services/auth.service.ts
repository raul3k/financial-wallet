import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginDto } from '../dto/login.dto';
import { LoggingService } from '../../logging/services/logging.service';
import { WalletsService } from '../../wallet/services/wallets.service';
import { UsersService } from '../../user/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly loggingService: LoggingService,
    private readonly walletService: WalletsService,
    private readonly userService: UsersService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    try {
      const user = await this.userService.createUser(registerUserDto);
      this.loggingService.logUserRegistration(user);
      await this.walletService.createWallet(user.id);

      return { message: 'User registered successfully' };
    } catch (error) {
      this.loggingService.error('Error registering user:', error);
      throw new BadRequestException('Error registering user');
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);

    this.loggingService.logUserLogin(user);

    return { accessToken: token };
  }
}
