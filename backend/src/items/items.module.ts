import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service.js';
import { ItemsController } from './items.controller.js';
import { Item } from './entities/item.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
