import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { UserProfile } from 'src/auth/entities/auth.entity';

@Entity({ schema: 'workspaces' })
export class WorkspaceMember {
  @PrimaryGeneratedColumn('increment', { name: 'workspaceMemberId' })
  id: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers, { eager: true })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => UserProfile, (user) => user.workspaceMembers)
  @JoinColumn({ name: 'userId' })
  user: UserProfile;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  joinedDate: Date;

  @Column('timestamp', { nullable: true })
  departureDate?: Date;

  @Column('varchar', { default: 'owner' })
  roleMember: string;

  @Column('boolean', { default: true })
  isOwner: boolean;

  @Column('boolean', { default: true })
  isOriginalOwner: boolean;

  @Column('boolean', { default: true })
  isAvailable: boolean;

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
}
