import { Controller, Get, Patch, Post, Param, Query, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Query('recipientId') recipientId?: string,
    @Query('recipientType') recipientType?: string,
  ) {
    return this.notificationsService.findAll(recipientId, recipientType);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  async markAllAsRead(@Body('recipientId') recipientId?: string) {
    await this.notificationsService.markAllAsRead(recipientId);
    return { success: true };
  }
}
