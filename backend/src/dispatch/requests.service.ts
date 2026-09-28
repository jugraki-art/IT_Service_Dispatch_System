import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequestEntity } from './entities/service-request.entity.js';
import { TechnicianEntity } from './entities/technician.entity.js';
import { CreateRequestDto } from './dto/create-request.dto.js';
import { NotificationsService } from './notifications.service.js';
import { AuditService } from './audit.service.js';
import { UserEntity } from './entities/user.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequestEntity)
    private readonly reqRepo: Repository<ServiceRequestEntity>,
    @InjectRepository(TechnicianEntity)
    private readonly techRepo: Repository<TechnicianEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly notifService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateRequestDto): Promise<ServiceRequestEntity> {
    const allRequests = await this.reqRepo.find({ select: { ticketNumber: true } });
    let maxNumber = 1040;
    const existingSet = new Set<string>();
    for (const r of allRequests) {
      if (r.ticketNumber) {
        existingSet.add(r.ticketNumber);
        const match = r.ticketNumber.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }
    let candidateNum = maxNumber + 1;
    while (existingSet.has(`REQ-${candidateNum}`)) {
      candidateNum++;
    }
    const ticketNumber = `REQ-${candidateNum}`;
    const rawDesc = dto.description || (dto as any).issueDescription || dto.title || 'IT Service Request';
    const desc = rawDesc.trim();
    const title = dto.title || (desc.length > 60 ? desc.slice(0, 57) + '...' : desc);

    let user: UserEntity | null = null;
    if (dto.requesterId) {
      user = await this.userRepo.findOne({ where: { id: dto.requesterId } });
    } else if (dto.requesterEmail) {
      user = await this.userRepo.findOne({ where: { email: dto.requesterEmail } });
    }
    if (!user) {
      user = await this.userRepo.findOne({ where: { role: 'user' } });
    }

    const request = this.reqRepo.create({
      id: randomUUID(),
      ticketNumber,
      requesterId: dto.requesterId || user?.id || 'usr-sarah-jenkins',
      requesterName: dto.requesterName || user?.name || 'Sarah Jenkins',
      requesterEmail: dto.requesterEmail || user?.email || 's.jenkins@org.corp',
      requesterDept: dto.requesterDept || user?.department || 'Financial Operations',
      requesterPhone: dto.requesterPhone || user?.phone || '+1 (555) 234-5678',
      locationBuilding: dto.locationBuilding || user?.building || 'Building 2',
      locationFloor: dto.locationFloor || user?.floor || 'Floor 3',
      locationRoom: dto.locationRoom || user?.room || 'Room 304',
      title,
      description: desc,
      category: dto.category || 'General',
      urgency: dto.urgency || 'medium',
      status: 'pending_admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.reqRepo.save(request);

    // Notify Admin of incoming request
    await this.notifService.create(
      'admin',
      'admin',
      `📥 New Request: ${saved.ticketNumber}`,
      `Submitted by ${saved.requesterName} (${saved.requesterDept}) at ${saved.locationRoom}. Priority: ${(saved.urgency || 'medium').toUpperCase()}.`,
      'alert',
      saved.id,
      saved.ticketNumber,
    );

    // Log Audit
    await this.auditService.log(
      saved.requesterName,
      'user',
      'CREATED_REQUEST',
      `Created ticket ${saved.ticketNumber}: "${saved.title}" in ${saved.locationBuilding} ${saved.locationRoom}`,
      saved.id,
    );

    return saved;
  }

  async findAll(status?: string, requesterId?: string, technicianId?: string): Promise<ServiceRequestEntity[]> {
    const query = this.reqRepo.createQueryBuilder('r');
    if (status) query.andWhere('r.status = :status', { status });
    if (requesterId) query.andWhere('r.requesterId = :requesterId', { requesterId });
    if (technicianId) query.andWhere('r.assignedTechnicianId = :technicianId', { technicianId });

    return query.orderBy('r.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<ServiceRequestEntity> {
    const req = await this.reqRepo.findOne({
      where: [{ id }, { ticketNumber: id }],
    });
    if (!req) throw new NotFoundException(`Request with ID or ticket number ${id} not found`);
    return req;
  }

  async startService(requestId: string): Promise<ServiceRequestEntity> {
    const req = await this.findOne(requestId);
    if (req.status !== 'assigned') {
      throw new BadRequestException(
        `Cannot start service on ticket in status: ${req.status}. Must be in 'assigned' state.`,
      );
    }

    req.status = 'in_progress';
    req.startedAt = new Date();
    req.updatedAt = new Date();
    const saved = await this.reqRepo.save(req);

    // Notify requester that technician has arrived
    await this.notifService.create(
      'user',
      req.requesterId,
      `🔧 Service in Progress: ${req.ticketNumber}`,
      `Technician ${req.assignedTechnicianName} has arrived on-site and started diagnostics.`,
      'status_update',
      req.id,
      req.ticketNumber,
    );

    // Log audit
    await this.auditService.log(
      req.assignedTechnicianName || 'IT Serviceman',
      'it_guy',
      'STARTED_SERVICE',
      `Began active repair work on ${req.ticketNumber}`,
      req.id,
    );

    return saved;
  }

  async completeService(requestId: string, resolutionNotes: string): Promise<ServiceRequestEntity> {
    const req = await this.findOne(requestId);
    if (req.status !== 'in_progress' && req.status !== 'assigned') {
      throw new BadRequestException(
        `Cannot complete service on ticket in status: ${req.status}.`,
      );
    }

    req.status = 'completed_by_it';
    req.completedAt = new Date();
    req.resolutionNotes = resolutionNotes || 'Service completed. Hardware/software issue resolved.';
    req.updatedAt = new Date();
    const saved = await this.reqRepo.save(req);

    // Urgent notification to Requester to inspect and terminate session
    await this.notifService.create(
      'user',
      req.requesterId,
      `🎉 Action Required: Service Finished (${req.ticketNumber})`,
      `Technician ${req.assignedTechnicianName} marked repair finished: "${req.resolutionNotes}". Please verify and terminate session to release technician.`,
      'completion',
      req.id,
      req.ticketNumber,
    );

    // Notify admin
    await this.notifService.create(
      'admin',
      'admin',
      `📋 Work Completed: ${req.ticketNumber}`,
      `Technician ${req.assignedTechnicianName} completed repairs. Awaiting user session sign-off.`,
      'status_update',
      req.id,
      req.ticketNumber,
    );

    // Log audit
    await this.auditService.log(
      req.assignedTechnicianName || 'IT Serviceman',
      'it_guy',
      'COMPLETED_SERVICE_BY_IT',
      `Submitted resolution notes for ${req.ticketNumber}: "${req.resolutionNotes}"`,
      req.id,
    );

    return saved;
  }

  async terminateSession(
    requestId: string,
    rating?: number,
    feedback?: string,
    requesterUserId?: string,
  ): Promise<{ request: ServiceRequestEntity; technician: TechnicianEntity | null }> {
    const req = await this.findOne(requestId);

    if (requesterUserId && req.requesterId && req.requesterId !== requesterUserId) {
      throw new BadRequestException('Unauthorized: You can only terminate your own service sessions.');
    }

    const terminableStatuses = [
      'assigned',
      'in_progress',
      'completed_by_it',
      'pending_verification',
    ];
    const normalizedStatus = req.status?.toLowerCase();
    if (!terminableStatuses.includes(normalizedStatus)) {
      throw new BadRequestException(
        `Cannot terminate session on ticket in status: ${req.status}. Must be in 'assigned', 'in_progress', or 'completed_by_it' state.`,
      );
    }

    const now = new Date();
    req.status = 'session_terminated';
    req.terminatedAt = now;
    if (rating !== undefined && rating !== null) {
      req.userRating = Math.max(1, Math.min(5, Math.round(rating)));
    }
    req.userFeedback = feedback || null;
    req.updatedAt = now;
    const savedReq = await this.reqRepo.save(req);

    // Release Technician to unoccupied!
    let updatedTech: TechnicianEntity | null = null;
    if (req.assignedTechnicianId) {
      const tech = await this.techRepo.findOne({ where: { id: req.assignedTechnicianId } });
      if (tech) {
        tech.status = 'unoccupied';
        tech.currentRequestId = null;
        tech.totalCompletedJobs = (tech.totalCompletedJobs || 0) + 1;

        if (req.userRating !== null && req.userRating !== undefined) {
          const currentRatingsCount = tech.ratingsCount || 0;
          const currentRating = Number(tech.rating) || 5.0;
          const newCount = currentRatingsCount + 1;
          const newRating = (currentRating * currentRatingsCount + req.userRating) / newCount;
          tech.rating = Math.round(newRating * 100) / 100;
          tech.ratingsCount = newCount;
        }
        updatedTech = await this.techRepo.save(tech);

        // Notify Technician of release
        await this.notifService.create(
          'it_guy',
          tech.id,
          `✅ Session Terminated: ${req.ticketNumber}`,
          `Requester ${req.requesterName} terminated the session. Your status is now UNOCCUPIED and available for new dispatches.`,
          'termination',
          req.id,
          req.ticketNumber,
        );
      }
    }

    // Notify Admin of ticket closure
    await this.notifService.create(
      'admin',
      'admin',
      `🏁 Ticket Closed: ${req.ticketNumber}`,
      `Requester ${req.requesterName} signed off on ${req.ticketNumber}. Technician ${req.assignedTechnicianName || 'N/A'} is now unoccupied.`,
      'termination',
      req.id,
      req.ticketNumber,
    );

    // Log Audit
    await this.auditService.log(
      req.requesterName,
      'user',
      'TERMINATED_SESSION',
      `Terminated session for ${req.ticketNumber}. Technician ${req.assignedTechnicianName || 'N/A'} released to unoccupied.`,
      req.id,
    );

    return { request: savedReq, technician: updatedTech };
  }
}
