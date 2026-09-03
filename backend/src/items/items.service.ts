import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity.js';
import { CreateItemDto } from './dto/create-item.dto.js';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item;
  }

  create(createItemDto: CreateItemDto): Promise<Item> {
    const item = this.itemsRepository.create(createItemDto);
    return this.itemsRepository.save(item);
  }

  async toggleStatus(id: number): Promise<Item> {
    const item = await this.findOne(id);
    item.isCompleted = !item.isCompleted;
    return this.itemsRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
  }
}
