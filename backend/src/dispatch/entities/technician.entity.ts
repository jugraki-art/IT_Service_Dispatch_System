import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('it_technicians')
export class TechnicianEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 100, default: 'IT Support Engineer' })
  roleTitle: string;

  @Column({ type: 'varchar', length: 100, default: 'IT End-User Services' })
  department: string;

  @Column({ type: 'varchar', length: 20, default: 'unoccupied' })
  status: 'unoccupied' | 'occupied' | 'absent';

  @Column({ type: 'varchar', length: 36, nullable: true })
  currentRequestId: string | null;

  @Column({ type: 'int', default: 0 })
  currentRoundAssignments: number;

  @Column({ type: 'int', default: 0 })
  lifetimeAssignments: number;

  @Column({ type: 'int', default: 0 })
  totalCompletedJobs: number;

  @Column({ type: 'datetime', nullable: true })
  lastAssignedAt: Date | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingsCount: number;

  @Column({ type: 'boolean', default: true })
  isOnline: boolean;

  @Column({ type: 'text' })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
