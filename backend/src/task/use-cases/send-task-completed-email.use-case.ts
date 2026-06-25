import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { MailerService } from 'src/common/services/mailer/mailer.service';
import { UserProfile } from 'src/auth/entities/auth.entity';
import { UserSettings } from 'src/profile/interfaces/settings.interface';
import { Task } from '../entities/task.entity';
import { SendTaskCompletedEmailUseCase } from '../classes/send-task-completed-email.class';
import { taskCompletedTemplate, TaskCompletedData } from '../templates/task-completed.template';

@Injectable()
export class SendTaskCompletedEmailUseCaseImp implements SendTaskCompletedEmailUseCase {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(UserProfile)
    private readonly userRepo: Repository<UserProfile>,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  async execute(taskId: number, completedByCode: string): Promise<void> {
    const task = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .leftJoinAndSelect('assignment.workspaceMember', 'wm')
      .leftJoinAndSelect('wm.user', 'assigneeUser')
      .leftJoinAndSelect('assigneeUser.profile', 'assigneeProfile')
      .leftJoinAndSelect('task.taskList', 'taskList')
      .leftJoinAndSelect('taskList.board', 'board')
      .leftJoinAndSelect('board.workspace', 'workspace')
      .where('task.id = :id', { id: taskId })
      .getOne();
    if (!task) return;

    const completer = await this.authService.isValidUser(completedByCode);
    const completedByName = `${completer.firstName} ${completer.lastName}`;
    const workspace = task.taskList.board.workspace;

    for (const assignment of task.assignments) {
      const profile = assignment.workspaceMember.user.profile;
      const settings = profile.settings as unknown as UserSettings;
      if (!settings.notifications.email.taskCompleted) continue;

      const name = `${profile.firstName} ${profile.firstSurname}`;
      const data: TaskCompletedData = {
        name,
        taskTitle: task.title,
        taskUrl: `${process.env.HOST_FRONTEND || 'http://localhost:4200'}/workspace/${workspace.code}/task/${taskId}`,
        workspaceName: workspace.title,
        completedByName,
        appName: process.env.APP_NAME || 'Task App',
      };
      const html = taskCompletedTemplate(data);

      this.mailerService.sendEmail(profile.email, `Tarea completada: ${task.title}`, html).catch(() => {});
    }
  }
}
