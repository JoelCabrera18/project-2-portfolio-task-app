import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { MailerService } from 'src/common/services/mailer/mailer.service';
import { UserProfile } from 'src/auth/entities/auth.entity';
import { UserSettings } from 'src/profile/interfaces/settings.interface';
import { SendNewMemberEmailUseCase } from '../classes/send-new-member-email.class';
import { Workspace } from '../entities/workspace.entity';
import { newMemberWorkspaceTemplate, NewMemberWorkspaceData } from '../templates/new-member-workspace.template';

@Injectable()
export class SendNewMemberEmailUseCaseImp implements SendNewMemberEmailUseCase {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    @InjectRepository(UserProfile)
    private readonly userRepo: Repository<UserProfile>,
  ) {}

  async execute(newMemberCode: string, inviterName: string, workspace: Workspace): Promise<void> {
    const newMember = await this.authService.isValidUser(newMemberCode);
    const user = await this.userRepo.findOne({
      where: { code: newMemberCode },
      relations: { profile: true },
    });
    if (!user) return;
    const settings = user.profile.settings as unknown as UserSettings;
    if (!settings.notifications.email.newMember) return;

    const name = `${newMember.firstName} ${newMember.lastName}`;
    const data: NewMemberWorkspaceData = {
      name,
      workspaceName: workspace.title,
      workspaceUrl: `${process.env.HOST_FRONTEND || 'http://localhost:4200'}/workspace/${workspace.code}`,
      inviterName,
      appName: process.env.APP_NAME || 'Task App',
    };
    const html = newMemberWorkspaceTemplate(data);

    this.mailerService.sendEmail(newMember.email, `Te han agregado a ${workspace.title}`, html).catch(() => {});
  }
}
