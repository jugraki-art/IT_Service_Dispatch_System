import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Item } from './items/entities/item.entity.js';
import { ItemsModule } from './items/items.module.js';

import { UserEntity } from './dispatch/entities/user.entity.js';
import { TechnicianEntity } from './dispatch/entities/technician.entity.js';
import { ServiceRequestEntity } from './dispatch/entities/service-request.entity.js';
import { DispatchRoundEntity } from './dispatch/entities/dispatch-round.entity.js';
import { AppNotificationEntity } from './dispatch/entities/app-notification.entity.js';
import { AuditLogEntity } from './dispatch/entities/audit-log.entity.js';
import { DispatchModule } from './dispatch/dispatch.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(config.get<string | number>('DB_PORT', 3306)),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'react_nest_db'),
        entities: [
          Item,
          UserEntity,
          TechnicianEntity,
          ServiceRequestEntity,
          DispatchRoundEntity,
          AppNotificationEntity,
          AuditLogEntity,
        ],
        synchronize: true,
      }),
    }),
    ItemsModule,
    DispatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
