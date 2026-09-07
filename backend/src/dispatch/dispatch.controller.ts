import { Controller, Get, Post, Body } from '@nestjs/common';
import { DispatchService, OddsCalculationResult } from './dispatch.service.js';
import { AssignTechnicianDto } from './dto/assign-technician.dto.js';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('odds')
  async getOdds(): Promise<OddsCalculationResult> {
    return this.dispatchService.calculateOdds();
  }

  @Post('assign')
  async assignTechnician(@Body() dto: AssignTechnicianDto) {
    return this.dispatchService.assignTechnician(
      dto.requestId,
      dto.technicianId,
      dto.adminName || 'Alex Mercer (Admin)',
    );
  }
}
