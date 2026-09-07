import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service.js';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.auditService.findAll(lim);
  }
}
