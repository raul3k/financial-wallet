import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [PrismaModule, LoggingModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
