import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getStatus() {
    return this.appService.getStatus();
  }

  @Get()
  getRoot() {
    return this.appService.getStatus();
  }
}
