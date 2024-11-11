import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from '../../logging/services/logging.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        wallet: {
          create: { balance: 0 },
        },
      },
    });

    this.loggingService.logUserRegistration({
      id: user.id,
      username: user.username,
    });
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    this.loggingService.log(`Retrieved user: ${userId}`);
    return user;
  }
}
