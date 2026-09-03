import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.toggleStatus(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
}
