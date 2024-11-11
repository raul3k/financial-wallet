import { Injectable, LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '../configs/winston-config';

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger = WinstonModule.createLogger(winstonConfig);

  log(message: string, params?: object) {
    this.logger.log(message, params);
  }

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }

  logUserRegistration(user: { id: string; username: string }) {
    const message = `New user registered: ${user.username}`;
    this.logger.log(message, { userId: user.id, username: user.username });
  }

  logUserLogin(user: { id: string; username: string }) {
    const message = `User logged in: ${user.username}`;
    this.logger.log(message, { userId: user.id, username: user.username });
  }
}
