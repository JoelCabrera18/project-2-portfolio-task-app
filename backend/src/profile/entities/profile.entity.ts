import { UserProfile } from 'src/auth/entities/auth.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'auth' })
export class Profile {
  @PrimaryGeneratedColumn('increment', { name: 'profileId' })
  id: number;

  @Column({ type: 'uuid', unique: true, name: 'profileCode' })
  @Generated('uuid')
  code: string;

  @Column({ type: 'text', nullable: false })
  firstName: string;

  @Column({ type: 'text', nullable: true })
  secondName?: string;

  @Column({ type: 'text', nullable: false })
  firstSurname: string;

  @Column({ type: 'text', nullable: true })
  secondSurname?: string;

  @Column({ type: 'text', nullable: true, name: 'profilePhoto' })
  photo?: string;

  @Column({ type: 'date', nullable: false, name: 'profileDateBirth' })
  dateBirth: Date;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', array: true, nullable: false })
  phone: string[];

  @Column({ type: 'boolean', default: false })
  isProfileAuthenticated: boolean;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column('jsonb', { nullable: false, default: {} })
  settings: Record<string, unknown>;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @OneToOne(() => UserProfile, (user) => user.profile, { nullable: false, cascade: true })
  user: UserProfile;
}
