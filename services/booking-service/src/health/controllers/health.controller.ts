import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  constructor() {}

  @Get('health')
  healthCheck() {
    return 'OK';
  }
}
