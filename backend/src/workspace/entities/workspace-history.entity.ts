import { UserProfile } from 'src/auth/entities/auth.entity';
import { EntityType } from 'src/common/enums/entity-type.enum';
import { WorkspaceAction } from 'src/common/enums/workspace-action.enum';
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

@Entity({ schema: 'workspaces' })
export class WorkspaceHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => UserProfile, (user) => user.workspacesHistories, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: UserProfile;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspacesHistories, { eager: true })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ type: 'varchar', length: 50, nullable: false })
  entityType: EntityType;

  @Column({ type: 'uuid', nullable: false })
  entityCode: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  action: WorkspaceAction;

  @Column({ type: 'varchar', length: 250, nullable: false })
  title: string;

  @Column({ type: 'jsonb', nullable: false })
  metadata: Record<string, unknown>;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: null,
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;
}
