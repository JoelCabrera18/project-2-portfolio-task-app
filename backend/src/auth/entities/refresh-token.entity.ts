import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'auth' })
export class RefreshToken {
  @PrimaryGeneratedColumn('increment', { name: 'refreshTokenId' })
  id: number;

  @Column('uuid', { unique: true, name: 'refreshTokenCode' })
  @Generated('uuid')
  code: string;

  @Column('text', { unique: true })
  token: string;

  @Column('uuid', { name: 'userCode' })
  userCode: string;

  @Column('timestamp', { name: 'expiresAt' })
  expiresAt: Date;

  @Column('boolean', { default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;
}
