import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, default: 'password123' })
  password: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: 'user' | 'admin' | 'it_guy';

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  building: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  room: string | null;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'text' })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  technicianId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
