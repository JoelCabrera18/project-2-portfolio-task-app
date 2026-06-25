import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Workspace } from 'src/workspace/entities/workspace.entity';
import { Repository } from 'typeorm';
import { SendInvitationToJoinToWorkspaceUseCase } from '../classes/send-invitation-to-join-to-workspace.class';
import { SendInvitationToJoinToWorkspaceDto } from '../dto/send-invitation-to-join-to-workspace.dto';
import { WorkspaceInvitation } from '../entities/workspace-invitation.entity';
import { InvitationTemplateData, invitationToWorkspaceTemplate } from '../templates/invitation-to-workspace.template';
import { MailerService } from '../../common/services/mailer/mailer.service';
import { FindOneWorkspaceUseCase } from 'src/workspace/classes/find-one-workspace.class';

@Injectable()
export class SendInvitationToJoinToWorkspaceUseCaseImp extends SendInvitationToJoinToWorkspaceUseCase {
  constructor(
    @InjectRepository(WorkspaceInvitation)
    private readonly workspaceInvitacionRepository: Repository<WorkspaceInvitation>,
    private readonly findoneworkspace: FindOneWorkspaceUseCase,
    private readonly authService: AuthService,
    private readonly mailService: MailerService,
  ) {
    super();
  }
  async execute(workspace: Workspace, dto: SendInvitationToJoinToWorkspaceDto): Promise<WorkspaceInvitation> {
    // TODO: enviar respuesta estructurada
    // validacion de datos
    const invitedUserProfile = await this.authService.existCredential(dto.invitedEmail);
    if (!invitedUserProfile) throw new NotFoundException('User invited not found');
    const inviterUserProfile = await this.authService.existCredential(dto.inviterEmail);
    if (!inviterUserProfile) throw new NotFoundException('Inviter user not found');

    //Creacion de la invitación
    const invitation = this.workspaceInvitacionRepository.create({
      workspace,
      user: invitedUserProfile,
      rolMember: dto.rolMember,
    });

    const $invitation = await this.workspaceInvitacionRepository.save(invitation);

    // TODO: enviar con la invitación con mail service
    const iworkspace = await this.findoneworkspace.execute(workspace.code);
    const frontend = process.env.HOST_FRONTEND;
    const url = `${frontend}/invite/${$invitation.code}`;
    const invitationTemplate: InvitationTemplateData = {
      workspace: iworkspace!,
      inviter: {
        name: `${inviterUserProfile.firstName} ${inviterUserProfile.lastName}`,
      },
      inviteUrl: url,
      appName: 'Trello Clone',
    };

    const htmlTemplate = invitationToWorkspaceTemplate(invitationTemplate);

    await this.mailService.sendEmail(dto.invitedEmail, 'Invitation to join the workspace', htmlTemplate);

    return $invitation;
  }
}
