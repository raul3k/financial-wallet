import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { PrometheusService } from '../services/prometheus.service';

@Controller('monitoring')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly prometheusService: PrometheusService,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }

  @Get('metrics')
  async getMetrics() {
    return this.prometheusService.getMetrics();
  }
}
