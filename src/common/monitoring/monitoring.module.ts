import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { PrometheusService } from './services/prometheus.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [PrometheusService],
  exports: [PrometheusService],
})
export class MonitoringModule {}
