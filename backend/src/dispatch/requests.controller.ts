import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { RequestsService } from './requests.service.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { CompleteServiceDto } from './dto/complete-service.dto.js';
import { TerminateSessionDto } from './dto/terminate-session.dto.js';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() dto: CreateRequestDto) {
    try {
      return await this.requestsService.create(dto);
    } catch (err: any) {
      console.error('ERROR in create request:', err);
      throw new BadRequestException(
        `Failed to create request: ${err?.message || err}`,
      );
    }
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('requesterId') requesterId?: string,
    @Query('technicianId') technicianId?: string,
  ) {
    return this.requestsService.findAll(status, requesterId, technicianId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Post(':id/start')
  async startService(@Param('id') id: string) {
    return this.requestsService.startService(id);
  }

  @Post(':id/complete')
  async completeService(
    @Param('id') id: string,
    @Body() dto: CompleteServiceDto,
  ) {
    return this.requestsService.completeService(id, dto.resolutionNotes);
  }

  @Post(':id/terminate')
  async terminateSession(
    @Param('id') id: string,
    @Body() dto: TerminateSessionDto,
  ) {
    const targetId = id || dto?.requestId;
    return this.requestsService.terminateSession(
      targetId!,
      dto?.rating,
      dto?.feedback,
      dto?.requesterUserId || dto?.requesterId,
    );
  }

  @Post('terminate')
  async terminateSessionBody(@Body() dto: TerminateSessionDto) {
    const targetId = dto?.requestId;
    return this.requestsService.terminateSession(
      targetId!,
      dto?.rating,
      dto?.feedback,
      dto?.requesterUserId || dto?.requesterId,
    );
  }
}
