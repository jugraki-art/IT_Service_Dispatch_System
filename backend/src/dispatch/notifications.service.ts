import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppNotificationEntity } from './entities/app-notification.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(AppNotificationEntity)
    private readonly notifRepo: Repository<AppNotificationEntity>,
  ) {}

  async create(
    recipientType: 'user' | 'it_guy' | 'admin' | 'all',
    recipientId: string,
    title: string,
    message: string,
    type: 'dispatch' | 'status_update' | 'completion' | 'termination' | 'alert',
    requestId?: string,
    ticketNumber?: string,
  ): Promise<AppNotificationEntity> {
    const notif = this.notifRepo.create({
      id: randomUUID(),
      recipientType,
      recipientId,
      title,
      message,
      type,
      requestId: requestId || null,
      ticketNumber: ticketNumber || null,
      isRead: false,
      createdAt: new Date(),
    });
    return this.notifRepo.save(notif);
  }

  async findAll(recipientId?: string, recipientType?: string): Promise<AppNotificationEntity[]> {
    const query = this.notifRepo.createQueryBuilder('n');
    if (recipientId) {
      query.where('n.recipientId = :recipientId OR n.recipientType = :allType', {
        recipientId,
        allType: 'all',
      });
    } else if (recipientType) {
      query.where('n.recipientType = :recipientType OR n.recipientType = :allType', {
        recipientType,
        allType: 'all',
      });
    }
    return query.orderBy('n.createdAt', 'DESC').take(100).getMany();
  }

  async markAsRead(id: string): Promise<AppNotificationEntity | null> {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (notif) {
      notif.isRead = true;
      return this.notifRepo.save(notif);
    }
    return null;
  }

  async markAllAsRead(recipientId?: string): Promise<void> {
    if (recipientId) {
      await this.notifRepo.update({ recipientId }, { isRead: true });
    } else {
      await this.notifRepo.update({}, { isRead: true });
    }
  }
}
