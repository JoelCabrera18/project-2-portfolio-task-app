import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from 'src/common/services/mailer/mailer.service';
import { UserSettings } from 'src/profile/interfaces/settings.interface';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { SendMemberRemovedEmailUseCase } from '../classes/send-member-removed-email.class';
import { memberRemovedWorkspaceTemplate, MemberRemovedWorkspaceData } from '../templates/member-removed-workspace.template';

@Injectable()
export class SendMemberRemovedEmailUseCaseImp implements SendMemberRemovedEmailUseCase {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepo: Repository<WorkspaceMember>,
    private readonly mailerService: MailerService,
  ) {}

  async execute(memberId: number): Promise<void> {
    const member = await this.workspaceMemberRepo.findOne({
      where: { id: memberId },
      relations: { user: { profile: true }, workspace: true },
    });
    if (!member) return;

    const profile = member.user.profile;
    const settings = profile.settings as unknown as UserSettings;
    if (!settings.notifications.email.newMember) return;

    const name = `${profile.firstName} ${profile.firstSurname}`;
    const data: MemberRemovedWorkspaceData = {
      name,
      workspaceName: member.workspace.title,
      appName: process.env.APP_NAME || 'Task App',
    };
    const html = memberRemovedWorkspaceTemplate(data);

    this.mailerService
      .sendEmail(profile.email, `Has sido eliminado de ${member.workspace.title}`, html)
      .catch(() => {});
  }
}
