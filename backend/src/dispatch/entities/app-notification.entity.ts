import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('app_notifications')
export class AppNotificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  recipientType: 'user' | 'it_guy' | 'admin' | 'all';

  @Column({ type: 'varchar', length: 50 })
  recipientId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 30, default: 'alert' })
  type: 'dispatch' | 'status_update' | 'completion' | 'termination' | 'alert';

  @Column({ type: 'varchar', length: 36, nullable: true })
  requestId: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  ticketNumber: string | null;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
