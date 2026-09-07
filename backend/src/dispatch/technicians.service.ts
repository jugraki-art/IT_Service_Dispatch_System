import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TechnicianEntity } from './entities/technician.entity.js';
import { NotificationsService } from './notifications.service.js';
import { AuditService } from './audit.service.js';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(TechnicianEntity)
    private readonly techRepo: Repository<TechnicianEntity>,
    private readonly notifService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(): Promise<TechnicianEntity[]> {
    return this.techRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TechnicianEntity> {
    const tech = await this.techRepo.findOne({ where: { id } });
    if (!tech) throw new NotFoundException(`Technician with ID ${id} not found`);
    return tech;
  }

  async updateAttendance(
    id: string,
    newStatus: 'absent' | 'unoccupied',
    adminName = 'Alex Mercer (Admin)',
  ): Promise<TechnicianEntity> {
    const tech = await this.findOne(id);

    if (tech.status === 'occupied') {
      throw new BadRequestException(
        `Cannot change status of technician ${tech.name} to '${newStatus}'. The technician is currently OCCUPIED on an active job and must complete the session before attendance changes.`,
      );
    }

    const previousStatus = tech.status;
    tech.status = newStatus;
    tech.updatedAt = new Date();
    const saved = await this.techRepo.save(tech);

    // Notify technician of attendance change
    const msg =
      newStatus === 'absent'
        ? `You have been marked ABSENT by Admin ${adminName}. You will be excluded from the dispatch queue until returned to work.`
        : `Admin ${adminName} marked you back to work (UNOCCUPIED). You have re-entered the active dispatch pool.`;

    await this.notifService.create(
      'it_guy',
      tech.id,
      `🌴 / ✅ Attendance Updated: ${newStatus.toUpperCase()}`,
      msg,
      'alert',
    );

    // Log Audit
    await this.auditService.log(
      adminName,
      'admin',
      'ATTENDANCE_OVERRIDE',
      `Changed ${tech.name} status from ${previousStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
    );

    return saved;
  }
}
