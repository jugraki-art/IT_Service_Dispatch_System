import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('dispatch_rounds')
export class DispatchRoundEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'int', unique: true })
  roundNumber: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  totalEligibleTechnicians: number;

  @Column({ type: 'text' })
  assignedTechnicianIdsJson: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  closedAt: Date | null;
}
