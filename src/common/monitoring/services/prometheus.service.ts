import { Injectable, OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';
import { collectDefaultMetrics } from 'prom-client';
import * as express from 'express';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private readonly collectDefaultMetrics = collectDefaultMetrics;

  constructor() {
    this.collectDefaultMetrics();
  }

  onModuleInit() {
    const app = express(); // Criação do app Express

    app.get('/metrics', (req, res) => {
      res.set('Content-Type', promClient.register.contentType);
      res.end(promClient.register.metrics());
    });

    app.listen(3001, () => {
      console.log(
        'Prometheus metrics available at http://localhost:3001/metrics',
      );
    });
  }

  getMetrics() {
    return promClient.register.metrics();
  }
}
