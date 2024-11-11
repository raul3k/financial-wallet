import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/services/logging.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletsModule } from '../wallet/wallet.module';
import { WalletsService } from '../wallet/services/wallets.service';
import { UsersService } from '../user/services/users.service';
import { UsersModule } from '../user/user.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    WalletsModule,
    UsersModule,
    TransactionsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    LoggingService,
    WalletsService,
    UsersService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
