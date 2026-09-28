import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity.js';
import { TechnicianEntity } from './entities/technician.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuditService } from './audit.service.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(TechnicianEntity)
    private readonly techRepo: Repository<TechnicianEntity>,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto): Promise<{
    success: boolean;
    user: UserEntity;
    technician: TechnicianEntity | null;
  }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    let technician: TechnicianEntity | null = null;
    if (user.role === 'it_guy') {
      if (user.technicianId) {
        technician = await this.techRepo.findOne({ where: { id: user.technicianId } });
      }
      if (!technician) {
        technician = await this.techRepo.findOne({ where: { email: user.email } });
      }
    }

    await this.auditService.log(
      user.name,
      user.role,
      'USER_LOGIN',
      `User logged into ${user.role.toUpperCase()} portal`,
    );

    return {
      success: true,
      user,
      technician,
    };
  }

  async register(dto: RegisterDto): Promise<{
    success: boolean;
    user: UserEntity;
    technician: TechnicianEntity | null;
  }> {
    // 1. Strict Security Guard: Prevent any Admin registration
    if ((dto.role as string) === 'admin' || (dto.role as string) === 'ADMIN') {
      throw new BadRequestException(
        'Security Violation: Administrator accounts cannot be self-registered. Only a single authorized administrator account exists with pre-configured credentials.',
      );
    }

    if (dto.role !== 'user' && dto.role !== 'it_guy') {
      throw new BadRequestException(
        'Invalid role. You may only register as a Service Requester (user) or an IT Serviceman (it_guy).',
      );
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const userId = randomUUID();
    let technicianId: string | null = null;
    let savedTech: TechnicianEntity | null = null;

    // 2. If registering as an IT Guy, automatically register in it_technicians roster!
    if (dto.role === 'it_guy') {
      technicianId = randomUUID();
      const tech = this.techRepo.create({
        id: technicianId,
        name: dto.name,
        email,
        phone: dto.phone,
        roleTitle: dto.roleTitle || 'IT Support Specialist',
        department: dto.department || 'IT End-User Support',
        status: 'unoccupied', // Free & ready for dispatch
        currentRequestId: null,
        currentRoundAssignments: 0,
        lifetimeAssignments: 0,
        totalCompletedJobs: 0,
        lastAssignedAt: null,
        rating: 5.0,
        ratingsCount: 0,
        isOnline: true,
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      });
      savedTech = await this.techRepo.save(tech);
    }

    // 3. Create User record
    const user = this.userRepo.create({
      id: userId,
      name: dto.name,
      email,
      password: dto.password,
      role: dto.role,
      department: dto.role === 'it_guy' ? null : (dto.department || 'General Staff'),
      building: dto.role === 'it_guy' ? null : (dto.building || null),
      floor: dto.role === 'it_guy' ? null : (dto.floor || null),
      room: dto.role === 'it_guy' ? null : (dto.room || null),
      phone: dto.phone || '+1 (555) 000-0000',
      avatarUrl:
        dto.role === 'it_guy'
          ? `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`
          : `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150`,
      technicianId,
    });

    const savedUser = await this.userRepo.save(user);

    await this.auditService.log(
      savedUser.name,
      savedUser.role,
      'USER_REGISTERED',
      `New user registered as ${savedUser.role.toUpperCase()} (${savedUser.email})`,
    );

    return {
      success: true,
      user: savedUser,
      technician: savedTech,
    };
  }

  async getMe(userId: string): Promise<{ user: UserEntity; technician: TechnicianEntity | null }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User session not found.');
    }
    let technician: TechnicianEntity | null = null;
    if (user.role === 'it_guy') {
      if (user.technicianId) {
        technician = await this.techRepo.findOne({ where: { id: user.technicianId } });
      } else {
        technician = await this.techRepo.findOne({ where: { email: user.email } });
      }
    }
    return { user, technician };
  }
}
