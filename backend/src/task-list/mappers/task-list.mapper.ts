import { Injectable } from '@nestjs/common';
import { TaskList } from '../entities/task-list.entity';
import { TaskListResponse } from 'src/common/responses/task-list.response';
import { toPhotoUrl } from '../../common/helpers/photo-url.helper';

const AVATAR_COLORS = ['#ef4444', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

function toInitials(firstName: string, firstSurname: string): string {
  return `${firstName.charAt(0)}${firstSurname.charAt(0)}`.toUpperCase();
}

function toAvatarColor(fullName: string): string {
  const index = fullName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

@Injectable()
export class TaskListMapper {
  toResponse(taskList: TaskList): TaskListResponse {
    const tasks = (taskList.tasks ?? [])
      .filter((task) => task.isAvailable)
      .map((task) => {
        const labels = (task.labels ?? []).map((tl) => ({
          id: tl.label.id,
          code: tl.label.code,
          name: tl.label.name,
          color: tl.label.color,
        }));

        const assignees = (task.assignments ?? []).map((assignment) => {
          const profile = assignment.workspaceMember?.user?.profile;
          const firstName = profile?.firstName ?? '';
          const firstSurname = profile?.firstSurname ?? '';
          const email = profile?.email ?? '';
          const fullname = `${firstName} ${firstSurname}`;
          return {
            id: assignment.id,
            workspaceMemberId: assignment.workspaceMember.id,
            fullname,
            email,
            photo: toPhotoUrl(profile?.photo, profile?.code),
            initials: toInitials(firstName, firstSurname),
            avatarColor: toAvatarColor(fullname),
          };
        });

        return {
          taskId: task.id,
          code: task.code,
          title: task.title,
          description: task.description,
          dateInit: task.dateInit,
          dateEnd: task.dateEnd,
          completed: task.completed,
          position: task.position,
          isAvailable: task.isAvailable,
          labels,
          assignees,
        };
      });

    return {
      id: taskList.id,
      code: taskList.code,
      title: taskList.title,
      position: taskList.position,
      isAvailable: taskList.isAvailable,
      tasks,
    };
  }

  toResponseList(taskLists: TaskList[]): TaskListResponse[] {
    return taskLists.map((tl) => this.toResponse(tl));
  }
}
