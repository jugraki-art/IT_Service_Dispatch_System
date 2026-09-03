import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Item } from './items/entities/item.entity.js';
import { ItemsModule } from './items/items.module.js';

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
        entities: [Item],
        synchronize: true,
      }),
    }),
    ItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
