import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';
import { EntityType } from 'src/common/enums/entity-type.enum';
import { CreateWorkspaceHistoryUseCase } from 'src/workspace/classes/create-workspace-history.class';
import { FindOneWorkspaceUseCase } from 'src/workspace/classes/find-one-workspace.class';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { WorkspaceInvitation } from './entities/workspace-invitation.entity';
import { Repository } from 'typeorm';
import { SendInvitationToJoinToWorkspaceUseCase } from './classes/send-invitation-to-join-to-workspace.class';
import { SendInvitationToJoinToWorkspaceDto } from './dto/send-invitation-to-join-to-workspace.dto';
import { GetWorkspaceInvitationsUseCase, InvitationItem } from './classes/get-workspace-invitations.class';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class WorkspaceInvitationService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceInvitation)
    private readonly invitationRepository: Repository<WorkspaceInvitation>,
    private readonly workspaceHistory: CreateWorkspaceHistoryUseCase,
    private readonly findOneWorkspaceUseCase: FindOneWorkspaceUseCase,
    private readonly sendInvitationToJoinToWorkspaceUseCase: SendInvitationToJoinToWorkspaceUseCase,
    private readonly getWorkspaceInvitationsUseCase: GetWorkspaceInvitationsUseCase,

    private readonly authService: AuthService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async sendWorkspaceInvitation(dto: SendInvitationToJoinToWorkspaceDto, user: AuthenticatedUserDto) {
    const senderUser = await this.authService.isValidUser(user.code);
    const workspace = await this.workspaceService.findOneBySearchTerm(dto.workspaceCode, senderUser);
    const useCase = await this.sendInvitationToJoinToWorkspaceUseCase.execute(workspace, dto);
    await this.workspaceHistory.sendWorkspaceInvitation(senderUser, workspace, workspace.code, EntityType.WORKSPACE);

    const frontend = process.env.HOST_FRONTEND;
    const inviteLink = `${frontend}/invite/${useCase.code}`;
    return { inviteLink };
  }

  async getInvitation(invitationCode: string) {
    const invitation = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .select(['workspace.code', 'workspaceInvitations'])
      .leftJoinAndSelect('workspace.workspaceInvitations', 'workspaceInvitations')
      .where('workspaceInvitations.code = :code', { code: invitationCode })
      .andWhere('workspaceInvitations.isAvailable = true')
      .getOne();
    if (!invitation) throw new NotFoundException('Invitation not found');

    const workspace = await this.findOneWorkspaceUseCase.execute(invitation.code);
    return { workspace, invitationCode };
  }

  async getWorkspaceInvitations(workspaceCode: string): Promise<InvitationItem[]> {
    return this.getWorkspaceInvitationsUseCase.execute(workspaceCode);
  }

  async invalidateInvitation(invitationCode: string) {
    const invitation = await this.invitationRepository.findOneBy({ code: invitationCode });
    if (!invitation) throw new NotFoundException('Invitation not found');
    invitation.isAvailable = false;
    await this.invitationRepository.save(invitation);
    return { message: 'Invitación invalidada' };
  }

  async resendWorkspaceInvitation(dto: SendInvitationToJoinToWorkspaceDto, user: AuthenticatedUserDto) {
    const senderUser = await this.authService.isValidUser(user.code);
    const workspace = await this.workspaceService.findOneBySearchTerm(dto.workspaceCode, senderUser);
    const invitedUser = await this.authService.existCredential(dto.invitedEmail);

    await this.invitationRepository.update(
      { workspace: { id: workspace.id }, user: { id: invitedUser.id }, isAvailable: true },
      { isAvailable: false },
    );

    return this.sendWorkspaceInvitation(dto, user);
  }
}
