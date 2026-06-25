import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { MailerService } from 'src/common/services/mailer/mailer.service';
import { UserSettings } from 'src/profile/interfaces/settings.interface';
import { Workspace } from '../entities/workspace.entity';
import { SendMemberJoinedEmailUseCase } from '../classes/send-member-joined-email.class';
import { memberJoinedWorkspaceTemplate, MemberJoinedWorkspaceData } from '../templates/member-joined-workspace.template';

@Injectable()
export class SendMemberJoinedEmailUseCaseImp implements SendMemberJoinedEmailUseCase {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  async execute(workspaceCode: string, newMemberCode: string): Promise<void> {
    const workspace = await this.workspaceRepo.findOne({
      where: { code: workspaceCode },
      relations: { user: { profile: true } },
    });
    if (!workspace) return;
    if (!workspace.user) return;

    const owner = workspace.user;
    const ownerSettings = owner.profile.settings as unknown as UserSettings;
    if (!ownerSettings.notifications.email.newMember) return;

    const newMember = await this.authService.isValidUser(newMemberCode);
    const newMemberName = `${newMember.firstName} ${newMember.lastName}`;
    const ownerName = `${owner.profile.firstName} ${owner.profile.firstSurname}`;

    const data: MemberJoinedWorkspaceData = {
      ownerName,
      newMemberName,
      workspaceName: workspace.title,
      workspaceUrl: `${process.env.HOST_FRONTEND || 'http://localhost:4200'}/workspace/${workspace.code}`,
      appName: process.env.APP_NAME || 'Task App',
    };
    const html = memberJoinedWorkspaceTemplate(data);

    this.mailerService
      .sendEmail(owner.profile.email, `${newMemberName} se unió a ${workspace.title}`, html)
      .catch(() => {});
  }
}
