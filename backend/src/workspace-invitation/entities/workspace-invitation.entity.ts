import { UserProfile } from 'src/auth/entities/auth.entity';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'workspaces' })
export class WorkspaceInvitation {
  @PrimaryGeneratedColumn('increment', { name: 'invitationId' })
  id: number;

  @Column('uuid', { name: 'invitacionCode', unique: true })
  @Generated('uuid')
  code: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceInvitations)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => UserProfile, (user) => user.workspaceInvitations)
  @JoinColumn({ name: 'userId' })
  user: UserProfile;

  @Column('varchar', { name: 'rolMember', nullable: false, default: 'viewer' })
  rolMember: string;

  @Column('boolean', { default: false })
  accepted: boolean;

  @Column('boolean', { default: true })
  isAvailable: boolean;

  @Column('timestamp', { nullable: true, default: null })
  dateAcepted: Date;

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
