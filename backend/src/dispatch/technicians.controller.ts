import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { TechniciansService } from './technicians.service.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  async findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.techniciansService.findOne(id);
  }

  @Patch(':id/attendance')
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.techniciansService.updateAttendance(
      id,
      dto.status,
      dto.adminName || 'Alex Mercer (Admin)',
    );
  }
}
