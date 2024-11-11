import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controllers/transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggingModule } from '../logging/logging.module';
import { WalletsModule } from '../wallet/wallet.module';

@Module({
  imports: [PrismaModule, LoggingModule, forwardRef(() => WalletsModule)],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
