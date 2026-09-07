import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity.js';
import { TechnicianEntity } from './entities/technician.entity.js';
import { ServiceRequestEntity } from './entities/service-request.entity.js';
import { DispatchRoundEntity } from './entities/dispatch-round.entity.js';
import { AppNotificationEntity } from './entities/app-notification.entity.js';
import { AuditLogEntity } from './entities/audit-log.entity.js';

import { DispatchService } from './dispatch.service.js';
import { RequestsService } from './requests.service.js';
import { TechniciansService } from './technicians.service.js';
import { NotificationsService } from './notifications.service.js';
import { AuditService } from './audit.service.js';
import { SeedService } from './seed.service.js';
import { AuthService } from './auth.service.js';

import { DispatchController } from './dispatch.controller.js';
import { RequestsController } from './requests.controller.js';
import { TechniciansController } from './technicians.controller.js';
import { NotificationsController } from './notifications.controller.js';
import { AuditController } from './audit.controller.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TechnicianEntity,
      ServiceRequestEntity,
      DispatchRoundEntity,
      AppNotificationEntity,
      AuditLogEntity,
    ]),
  ],
  controllers: [
    AuthController,
    DispatchController,
    RequestsController,
    TechniciansController,
    NotificationsController,
    AuditController,
  ],
  providers: [
    AuthService,
    DispatchService,
    RequestsService,
    TechniciansService,
    NotificationsService,
    AuditService,
    SeedService,
  ],
  exports: [
    AuthService,
    DispatchService,
    RequestsService,
    TechniciansService,
    NotificationsService,
    AuditService,
  ],
})
export class DispatchModule {}
