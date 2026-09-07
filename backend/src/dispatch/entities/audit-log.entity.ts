import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'varchar', length: 100 })
  actorName: string;

  @Column({ type: 'varchar', length: 20 })
  actorRole: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'text' })
  details: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  requestId: string | null;
}
