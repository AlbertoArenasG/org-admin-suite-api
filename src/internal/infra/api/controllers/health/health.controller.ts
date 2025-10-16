import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';

@Controller()
export class HealthController {
  private readonly sinceTime = new Date();

  constructor(private readonly health: HealthCheckService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/healthy')
  @HealthCheck()
  async checkServerHealthy() {
    return this.health.check([
      () => {
        return {
          server: {
            status: 'up',
            message: 'server is running',
            since: this.sinceTime,
          },
        };
      },
    ]);
  }
}
