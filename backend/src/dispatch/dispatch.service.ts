import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TechnicianEntity } from './entities/technician.entity.js';
import { ServiceRequestEntity } from './entities/service-request.entity.js';
import { DispatchRoundEntity } from './entities/dispatch-round.entity.js';
import { NotificationsService } from './notifications.service.js';
import { AuditService } from './audit.service.js';
import { randomUUID } from 'node:crypto';

export interface RankedTechnician {
  technicianId: string;
  name: string;
  avatarUrl: string;
  phone: string;
  roleTitle: string;
  department: string;
  status: 'unoccupied' | 'occupied' | 'absent';
  oddsPercentage: number;
  priorityScore: number;
  isHighestOdds: boolean;
  rank: number;
  idleMinutes: number;
  idleMinutesFormatted: string;
  explanation: string;
  hasBeenAssignedInRound: boolean;
  rating: number;
  completedJobs: number;
}

export interface OddsCalculationResult {
  roundNumber: number;
  totalUnoccupied: number;
  totalTechnicians: number;
  totalAssignedInRound: number;
  candidates: RankedTechnician[];
}

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(TechnicianEntity)
    private readonly techRepo: Repository<TechnicianEntity>,
    @InjectRepository(ServiceRequestEntity)
    private readonly reqRepo: Repository<ServiceRequestEntity>,
    @InjectRepository(DispatchRoundEntity)
    private readonly roundRepo: Repository<DispatchRoundEntity>,
    private readonly notifService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async getActiveRound(): Promise<DispatchRoundEntity> {
    let round = await this.roundRepo.findOne({ where: { isActive: true } });
    if (!round) {
      const eligibleCount = await this.techRepo.count({ where: { isOnline: true } });
      round = this.roundRepo.create({
        id: randomUUID(),
        roundNumber: 1,
        isActive: true,
        totalEligibleTechnicians: eligibleCount || 5,
        assignedTechnicianIdsJson: JSON.stringify([]),
        startedAt: new Date(),
      });
      round = await this.roundRepo.save(round);
    }
    return round;
  }

  async calculateOdds(): Promise<OddsCalculationResult> {
    const round = await this.getActiveRound();
    const assignedInRound = new Set<string>(JSON.parse(round.assignedTechnicianIdsJson || '[]'));

    const allTechnicians = await this.techRepo.find();
    const unoccupied = allTechnicians.filter((t) => t.status === 'unoccupied');

    if (unoccupied.length === 0) {
      return {
        roundNumber: round.roundNumber,
        totalUnoccupied: 0,
        totalTechnicians: allTechnicians.length,
        totalAssignedInRound: assignedInRound.size,
        candidates: [],
      };
    }

    const now = Date.now();
    const scoredCandidates = unoccupied.map((tech) => {
      const hasBeenAssignedInRound =
        assignedInRound.has(tech.id) || tech.currentRoundAssignments > 0;

      let idleMinutes = 9999;
      if (tech.lastAssignedAt) {
        idleMinutes = Math.max(
          0,
          Math.floor((now - new Date(tech.lastAssignedAt).getTime()) / 60000),
        );
      }

      let rawScore = 0;
      let explanation = '';

      if (!hasBeenAssignedInRound) {
        // High priority turn in current round: 1000 + idle bonus (up to 500)
        const idleBonus = Math.min(idleMinutes * 2, 500);
        rawScore = 1000 + idleBonus;
        explanation =
          tech.lastAssignedAt === null
            ? `Fresh turn in Round ${round.roundNumber}. Never assigned recently (Maximum Priority).`
            : `Selected earlier (${this.formatDuration(idleMinutes)} ago). Highest priority turn in Round ${round.roundNumber}.`;
      } else {
        // Decayed priority: 50 + minor idle bonus (up to 50)
        const minorIdleBonus = Math.min(idleMinutes * 0.2, 50);
        rawScore = 50 + minorIdleBonus;
        explanation = `Decayed odds: Already dispatched in Round ${round.roundNumber}. Odds remain low until the current cohort completes.`;
      }

      return {
        tech,
        rawScore,
        idleMinutes,
        hasBeenAssignedInRound,
        explanation,
      };
    });

    // Sort descending by rawScore (highest score first)
    scoredCandidates.sort((a, b) => b.rawScore - a.rawScore);

    const totalScore = scoredCandidates.reduce((sum, item) => sum + item.rawScore, 0);

    let runningSum = 0;
    const candidates: RankedTechnician[] = scoredCandidates.map((item, index) => {
      const rawPercentage = totalScore > 0 ? (item.rawScore / totalScore) * 100 : 0;
      let percentage = Math.max(1, Math.round(rawPercentage));

      // Balance last item to guarantee 100% total
      if (index === scoredCandidates.length - 1 && scoredCandidates.length > 1) {
        percentage = Math.max(1, 100 - runningSum);
      }
      runningSum += percentage;

      const isTop = index === 0;

      return {
        technicianId: item.tech.id,
        name: item.tech.name,
        avatarUrl: item.tech.avatarUrl,
        phone: item.tech.phone,
        roleTitle: item.tech.roleTitle,
        department: item.tech.department,
        status: item.tech.status,
        oddsPercentage: percentage,
        priorityScore: Math.round(item.rawScore),
        isHighestOdds: isTop,
        rank: index + 1,
        idleMinutes: item.idleMinutes,
        idleMinutesFormatted: this.formatDuration(item.idleMinutes),
        explanation: isTop
          ? `⭐ Top Recommendation (Highest Odds): ${item.explanation}`
          : item.explanation,
        hasBeenAssignedInRound: item.hasBeenAssignedInRound,
        rating: Number(item.tech.rating) || 5.0,
        completedJobs: item.tech.totalCompletedJobs || 0,
      };
    });

    return {
      roundNumber: round.roundNumber,
      totalUnoccupied: unoccupied.length,
      totalTechnicians: allTechnicians.length,
      totalAssignedInRound: assignedInRound.size,
      candidates,
    };
  }

  async assignTechnician(
    requestId: string,
    technicianId: string,
    adminName = 'Alex Mercer (Admin)',
  ): Promise<{ success: boolean; message: string; request: ServiceRequestEntity; roundNumber: number }> {
    const request = await this.reqRepo.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException(`Service request with ID ${requestId} not found`);
    }

    if (request.status !== 'pending_admin') {
      throw new BadRequestException(
        `Request ${request.ticketNumber} is not pending admin dispatch (current status: ${request.status})`,
      );
    }

    const technician = await this.techRepo.findOne({ where: { id: technicianId } });
    if (!technician) {
      throw new NotFoundException(`Technician with ID ${technicianId} not found`);
    }

    if (technician.status !== 'unoccupied') {
      throw new BadRequestException(
        `Technician ${technician.name} is currently ${technician.status} and cannot be dispatched`,
      );
    }

    const now = new Date();

    // 1. Update Request
    request.status = 'assigned';
    request.assignedTechnicianId = technician.id;
    request.assignedTechnicianName = technician.name;
    request.assignedTechnicianPhone = technician.phone;
    request.assignedAt = now;
    await this.reqRepo.save(request);

    // 2. Update Technician Status to occupied
    technician.status = 'occupied';
    technician.currentRequestId = request.id;
    technician.currentRoundAssignments += 1;
    technician.lifetimeAssignments += 1;
    technician.lastAssignedAt = now;
    await this.techRepo.save(technician);

    // 3. Track in Active Round
    const round = await this.getActiveRound();
    const assignedSet = new Set<string>(JSON.parse(round.assignedTechnicianIdsJson || '[]'));
    assignedSet.add(technician.id);
    round.assignedTechnicianIdsJson = JSON.stringify(Array.from(assignedSet));
    await this.roundRepo.save(round);

    // 4. Cohort Exhaustion Check
    // All non-absent technicians
    const nonAbsentTechnicians = await this.techRepo.find({
      where: [{ status: 'unoccupied' }, { status: 'occupied' }],
    });
    const eligibleCount = nonAbsentTechnicians.length;

    let currentRoundNumber = round.roundNumber;
    if (assignedSet.size >= eligibleCount && eligibleCount > 0) {
      // Cohort exhausted -> Advance to next round!
      round.isActive = false;
      round.closedAt = now;
      await this.roundRepo.save(round);

      const nextRound = this.roundRepo.create({
        id: randomUUID(),
        roundNumber: round.roundNumber + 1,
        isActive: true,
        totalEligibleTechnicians: eligibleCount,
        assignedTechnicianIdsJson: JSON.stringify([]),
        startedAt: now,
      });
      await this.roundRepo.save(nextRound);
      currentRoundNumber = nextRound.roundNumber;

      // Reset all technicians current round counter
      const allTechs = await this.techRepo.find();
      for (const t of allTechs) {
        t.currentRoundAssignments = 0;
        await this.techRepo.save(t);
      }

      await this.auditService.log(
        'System Engine',
        'system',
        'ROUND_EXHAUSTION_ADVANCED',
        `All ${eligibleCount} eligible IT Servicemen were dispatched. Round advanced to ${nextRound.roundNumber}. All odds reset.`,
        request.id,
      );
    }

    // 5. Send Real-time Push Notifications
    // To Technician
    await this.notifService.create(
      'it_guy',
      technician.id,
      `⚡ New Dispatch: ${request.ticketNumber}`,
      `Assigned to assist ${request.requesterName} (${request.requesterDept}) at ${request.locationRoom} (${request.locationBuilding}). Issue: ${request.title}`,
      'dispatch',
      request.id,
      request.ticketNumber,
    );

    // To Requester
    await this.notifService.create(
      'user',
      request.requesterId,
      `👨‍🔧 Technician Dispatched: ${technician.name}`,
      `${technician.name} (${technician.roleTitle}) has been assigned to your ticket ${request.ticketNumber} and is en route.`,
      'status_update',
      request.id,
      request.ticketNumber,
    );

    // To Admin
    await this.notifService.create(
      'admin',
      'admin',
      `✅ Dispatch Completed: ${request.ticketNumber}`,
      `${technician.name} was successfully assigned to ticket ${request.ticketNumber} by ${adminName}.`,
      'status_update',
      request.id,
      request.ticketNumber,
    );

    // 6. Log Audit Event
    await this.auditService.log(
      adminName,
      'admin',
      'ASSIGNED_TECHNICIAN',
      `Dispatched IT Serviceman ${technician.name} to ticket ${request.ticketNumber} (${request.title})`,
      request.id,
    );

    return {
      success: true,
      message: `Technician ${technician.name} dispatched to ${request.ticketNumber}`,
      request,
      roundNumber: currentRoundNumber,
    };
  }

  private formatDuration(minutes: number): string {
    if (minutes >= 9999 || minutes < 0) return 'Never / Long ago';
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}
