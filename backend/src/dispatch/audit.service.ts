import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async log(
    actorName: string,
    actorRole: string,
    action: string,
    details: string,
    requestId?: string,
  ): Promise<AuditLogEntity> {
    const entry = this.auditRepo.create({
      id: randomUUID(),
      timestamp: new Date(),
      actorName,
      actorRole,
      action,
      details,
      requestId: requestId || null,
    });
    return this.auditRepo.save(entry);
  }

  async findAll(limit = 50): Promise<AuditLogEntity[]> {
    return this.auditRepo.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
