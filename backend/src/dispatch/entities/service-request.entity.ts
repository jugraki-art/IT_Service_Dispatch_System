import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('service_requests')
export class ServiceRequestEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  ticketNumber: string;

  @Column({ type: 'varchar', length: 36 })
  requesterId: string;

  @Column({ type: 'varchar', length: 100 })
  requesterName: string;

  @Column({ type: 'varchar', length: 150 })
  requesterEmail: string;

  @Column({ type: 'varchar', length: 100 })
  requesterDept: string;

  @Column({ type: 'varchar', length: 50 })
  requesterPhone: string;

  @Column({ type: 'varchar', length: 50, default: 'Building 2', nullable: true })
  locationBuilding: string;

  @Column({ type: 'varchar', length: 50, default: 'Floor 3', nullable: true })
  locationFloor: string;

  @Column({ type: 'varchar', length: 50, default: 'Room 304', nullable: true })
  locationRoom: string;

  @Column({ type: 'varchar', length: 255, default: 'IT Service Request', nullable: true })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'General', nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 20, default: 'medium', nullable: true })
  urgency: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'varchar', length: 30, default: 'pending_admin' })
  status: 'pending_admin' | 'assigned' | 'in_progress' | 'completed_by_it' | 'session_terminated';

  @Column({ type: 'varchar', length: 36, nullable: true })
  assignedTechnicianId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignedTechnicianName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  assignedTechnicianPhone: string | null;

  @Column({ type: 'datetime', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  terminatedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string | null;

  @Column({ type: 'int', nullable: true })
  userRating: number | null;

  @Column({ type: 'text', nullable: true })
  userFeedback: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
