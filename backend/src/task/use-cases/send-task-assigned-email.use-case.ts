import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from 'src/common/services/mailer/mailer.service';
import { WorkspaceMember } from 'src/workspace/entities/workspace-member.entity';
import { Task } from '../entities/task.entity';
import { UserSettings } from 'src/profile/interfaces/settings.interface';
import { SendTaskAssignedEmailUseCase } from '../classes/send-task-assigned-email.class';
import { taskAssignedTemplate, TaskAssignedData } from '../templates/task-assigned.template';

@Injectable()
export class SendTaskAssignedEmailUseCaseImp implements SendTaskAssignedEmailUseCase {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly mailerService: MailerService,
  ) {}

  async execute(workspaceMemberId: number, taskId: number): Promise<void> {
    const wm = await this.workspaceMemberRepo.findOne({
      where: { id: workspaceMemberId },
      relations: { user: { profile: true }, workspace: true },
    });
    if (!wm) return;

    const task = await this.taskRepo.findOneBy({ id: taskId });
    if (!task) return;

    const settings = wm.user.profile.settings as unknown as UserSettings;
    if (!settings.notifications.email.taskAssigned) return;

    const name = `${wm.user.profile.firstName} ${wm.user.profile.firstSurname}`;
    const data: TaskAssignedData = {
      name,
      taskTitle: task.title,
      taskUrl: `${process.env.HOST_FRONTEND || 'http://localhost:4200'}/workspace/${wm.workspace.code}/task/${taskId}`,
      workspaceName: wm.workspace.title,
      appName: process.env.APP_NAME || 'Task App',
    };
    const html = taskAssignedTemplate(data);

    this.mailerService.sendEmail(wm.user.profile.email, `Te asignaron: ${task.title}`, html).catch(() => {});
  }
}
