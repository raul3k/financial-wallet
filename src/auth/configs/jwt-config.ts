import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConfig {
  readonly secret = process.env.JWT_SECRET || 'defaultSecret';
}
