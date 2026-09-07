import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity.js';
import { TechnicianEntity } from './entities/technician.entity.js';
import { ServiceRequestEntity } from './entities/service-request.entity.js';
import { DispatchRoundEntity } from './entities/dispatch-round.entity.js';
import { AppNotificationEntity } from './entities/app-notification.entity.js';
import { AuditLogEntity } from './entities/audit-log.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(TechnicianEntity)
    private readonly techRepo: Repository<TechnicianEntity>,
    @InjectRepository(ServiceRequestEntity)
    private readonly reqRepo: Repository<ServiceRequestEntity>,
    @InjectRepository(DispatchRoundEntity)
    private readonly roundRepo: Repository<DispatchRoundEntity>,
    @InjectRepository(AppNotificationEntity)
    private readonly notifRepo: Repository<AppNotificationEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  async seedData() {
    console.log('Ensuring system security credentials and initial data in MySQL...');

    // 1. Ensure the Exclusive Single Admin Account exists with known credentials
    let admin = await this.userRepo.findOne({ where: { email: 'admin@dispatch.corp' } });
    if (!admin) {
      admin = this.userRepo.create({
        id: 'usr-admin-primary',
        name: 'Alex Mercer (Operations Lead)',
        email: 'admin@dispatch.corp',
        password: 'Admin@2026!',
        role: 'admin',
        department: 'IT Operations Command Center',
        building: 'Building 1',
        floor: 'Floor 1',
        room: 'Command Suite 101',
        phone: '+1 (555) 100-9999',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        technicianId: null,
      });
      await this.userRepo.save(admin);
      console.log('✅ Created exclusive Admin account: admin@dispatch.corp / Admin@2026!');
    }

    // 2. Ensure Demo Requester Sarah Jenkins exists
    let sarah = await this.userRepo.findOne({ where: { email: 'sarah@dispatch.corp' } });
    if (!sarah) {
      sarah = this.userRepo.create({
        id: 'usr-sarah-jenkins',
        name: 'Sarah Jenkins',
        email: 'sarah@dispatch.corp',
        password: 'user123',
        role: 'user',
        department: 'Financial Operations',
        building: 'Building 2',
        floor: 'Floor 3',
        room: 'Room 304',
        phone: '+1 (555) 234-5678',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        technicianId: null,
      });
      await this.userRepo.save(sarah);
      console.log('✅ Created Demo Requester: sarah@dispatch.corp / user123');
    }

    // 3. Ensure Demo IT Serviceman Marcus Vance exists
    let marcusUser = await this.userRepo.findOne({ where: { email: 'marcus@dispatch.corp' } });
    if (!marcusUser) {
      marcusUser = this.userRepo.create({
        id: 'usr-marcus-vance',
        name: 'Marcus Vance',
        email: 'marcus@dispatch.corp',
        password: 'tech123',
        role: 'it_guy',
        department: 'IT Infrastructure & End-User Support',
        building: 'Building 1',
        floor: 'Floor 1',
        room: 'IT Operations 102',
        phone: '+1 (555) 789-0123',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        technicianId: 'tech-1',
      });
      await this.userRepo.save(marcusUser);
      console.log('✅ Created Demo IT Serviceman: marcus@dispatch.corp / tech123');
    }

    // Ensure technician Marcus exists in it_technicians
    let marcusTech = await this.techRepo.findOne({ where: { id: 'tech-1' } });
    if (!marcusTech) {
      marcusTech = this.techRepo.create({
        id: 'tech-1',
        name: 'Marcus Vance',
        email: 'marcus@dispatch.corp',
        phone: '+1 (555) 789-0123',
        roleTitle: 'Senior Systems Support Specialist',
        department: 'IT Infrastructure & End-User',
        status: 'unoccupied',
        currentRequestId: null,
        currentRoundAssignments: 0,
        lifetimeAssignments: 42,
        totalCompletedJobs: 42,
        lastAssignedAt: new Date(Date.now() - 210 * 60 * 1000),
        rating: 4.95,
        ratingsCount: 38,
        isOnline: true,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      });
      await this.techRepo.save(marcusTech);
    }

    // Check if initial technicians seeded
    const techCount = await this.techRepo.count();
    if (techCount < 4) {
      const now = Date.now();
      const additionalTechs: TechnicianEntity[] = [
        this.techRepo.create({
          id: 'tech-2',
          name: 'Elena Rostova',
          email: 'elena@dispatch.corp',
          phone: '+1 (555) 890-1234',
          roleTitle: 'Network & Connectivity Engineer',
          department: 'Network Operations',
          status: 'unoccupied',
          currentRequestId: null,
          currentRoundAssignments: 0,
          lifetimeAssignments: 35,
          totalCompletedJobs: 35,
          lastAssignedAt: new Date(now - 95 * 60 * 1000),
          rating: 4.88,
          ratingsCount: 29,
          isOnline: true,
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        }),
        this.techRepo.create({
          id: 'tech-3',
          name: 'Tariq Al-Mansoor',
          email: 'tariq@dispatch.corp',
          phone: '+1 (555) 901-2345',
          roleTitle: 'Field Hardware Specialist',
          department: 'Hardware Maintenance',
          status: 'occupied',
          currentRequestId: 'req-active-1',
          currentRoundAssignments: 1,
          lifetimeAssignments: 28,
          totalCompletedJobs: 27,
          lastAssignedAt: new Date(now - 25 * 60 * 1000),
          rating: 4.9,
          ratingsCount: 25,
          isOnline: true,
          avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        }),
        this.techRepo.create({
          id: 'tech-4',
          name: 'Chloe Bennett',
          email: 'chloe@dispatch.corp',
          phone: '+1 (555) 012-3456',
          roleTitle: 'Workstation & AV Specialist',
          department: 'Audio-Visual Support',
          status: 'absent',
          currentRequestId: null,
          currentRoundAssignments: 0,
          lifetimeAssignments: 19,
          totalCompletedJobs: 19,
          lastAssignedAt: new Date(now - 2880 * 60 * 1000),
          rating: 4.75,
          ratingsCount: 16,
          isOnline: false,
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        }),
        this.techRepo.create({
          id: 'tech-5',
          name: 'Samira Khan',
          email: 'samira@dispatch.corp',
          phone: '+1 (555) 123-4567',
          roleTitle: 'Cybersecurity & Access Specialist',
          department: 'Security & Access Control',
          status: 'unoccupied',
          currentRequestId: null,
          currentRoundAssignments: 1,
          lifetimeAssignments: 51,
          totalCompletedJobs: 51,
          lastAssignedAt: new Date(now - 45 * 60 * 1000),
          rating: 4.98,
          ratingsCount: 47,
          isOnline: true,
          avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
        }),
      ];
      await this.techRepo.save(additionalTechs);

      // Create matching user logins for other technicians
      for (const t of additionalTechs) {
        let u = await this.userRepo.findOne({ where: { email: t.email } });
        if (!u) {
          u = this.userRepo.create({
            id: `usr-${t.id}`,
            name: t.name,
            email: t.email,
            password: 'tech123',
            role: 'it_guy',
            department: t.department,
            building: 'Building 1',
            floor: 'Floor 1',
            room: 'IT Suite',
            phone: t.phone,
            avatarUrl: t.avatarUrl,
            technicianId: t.id,
          });
          await this.userRepo.save(u);
        }
      }
    }

    // 4. Ensure Active Dispatch Round 1
    const roundCount = await this.roundRepo.count();
    if (roundCount === 0) {
      const r = this.roundRepo.create({
        id: randomUUID(),
        roundNumber: 1,
        isActive: true,
        totalEligibleTechnicians: 5,
        assignedTechnicianIdsJson: JSON.stringify(['tech-3', 'tech-5']),
        startedAt: new Date(Date.now() - 120 * 60 * 1000),
      });
      await this.roundRepo.save(r);
    }

    console.log('✅ System authentication and seed data verified in MySQL!');
  }
}
