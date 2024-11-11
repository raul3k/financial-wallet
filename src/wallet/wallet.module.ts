import { forwardRef, Module } from '@nestjs/common';
import { WalletsService } from './services/wallets.service';
import { WalletsController } from './controllers/wallets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggingModule } from '../logging/logging.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, LoggingModule, forwardRef(() => TransactionsModule)],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
