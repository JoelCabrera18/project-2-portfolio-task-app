import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceMember } from './workspace-member.entity';
import { UserProfile } from 'src/auth/entities/auth.entity';
import { WorkspaceHistory } from './workspace-history.entity';
import { Board } from './board.entity';
import { WorkspaceInvitation } from 'src/workspace-invitation/entities/workspace-invitation.entity';

@Entity({ schema: 'workspaces' })
export class Workspace {
  @PrimaryGeneratedColumn('increment', { name: 'workspaceId' })
  id: number;

  @Column('uuid', { unique: true, name: 'workspaceCode' })
  @Generated('uuid')
  code: string;

  @Column('text', { name: 'workspaceSlugCode' })
  slugCode: string;

  @Column('text')
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  color: string;

  @Column('int', { default: 1 })
  status: number;

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

  @BeforeInsert()
  generateSlugCode() {
    if (!this.slugCode) {
      this.slugCode = this.title;
    }
    this.slugCode = this.slugCode
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  @BeforeUpdate()
  regenerateSlugCode() {
    this.slugCode = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  @OneToMany(() => WorkspaceMember, (workspaceMember) => workspaceMember.workspace, { cascade: true })
  workspaceMembers: WorkspaceMember[];

  @ManyToOne(() => UserProfile, (user) => user.workspaces)
  @JoinColumn({ name: 'created_by' })
  user: UserProfile;

  @OneToMany(() => WorkspaceHistory, (history) => history.workspace)
  workspacesHistories: WorkspaceHistory[];

  @OneToMany(() => Board, (board) => board.workspace, { cascade: true })
  boards: Board[];

  @OneToMany(() => WorkspaceInvitation, (invitation) => invitation.workspace)
  workspaceInvitations: WorkspaceInvitation[];
}
