import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {}
