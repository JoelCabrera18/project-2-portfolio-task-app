import { Module } from '@nestjs/common';
import { WorkspaceInvitationService } from './workspace-invitation.service';
import { WorkspaceInvitationController } from './workspace-invitation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceInvitation } from './entities/workspace-invitation.entity';
import { CommonModule } from '../common/common.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { SendInvitationToJoinToWorkspaceUseCaseImp } from './use-cases/send-invitation-to-join-to-workspace.use-case';
import { SendInvitationToJoinToWorkspaceUseCase } from './classes/send-invitation-to-join-to-workspace.class';
import { GetWorkspaceInvitationsUseCase } from './classes/get-workspace-invitations.class';
import { GetWorkspaceInvitationsUseCaseImp } from './use-cases/get-workspace-invitations.use-case';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [WorkspaceInvitationController],
  providers: [
    WorkspaceInvitationService,
    { provide: SendInvitationToJoinToWorkspaceUseCase, useClass: SendInvitationToJoinToWorkspaceUseCaseImp },
    { provide: GetWorkspaceInvitationsUseCase, useClass: GetWorkspaceInvitationsUseCaseImp },
  ],
  imports: [TypeOrmModule.forFeature([WorkspaceInvitation]), CommonModule, AuthModule, WorkspaceModule],
  exports: [TypeOrmModule],
})
export class WorkspaceInvitationModule {}
