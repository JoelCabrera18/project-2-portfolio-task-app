import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskList } from 'src/task-list/entities/task-list.entity';
import { ITask } from 'src/workspace/interfaces/workspace-response.interface';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { AssignMemberUseCase } from './classes/assign-member.class';
import { CreateTaskLabelUseCase } from './classes/create-task-label.class';
import { DeleteTaskLabelUseCase } from './classes/delete-task-label.class';
import { ReorderTasksUseCase } from './classes/reorder-tasks.class';
import { UnassignMemberUseCase } from './classes/unassign-member.class';
import { SendTaskAssignedEmailUseCase } from './classes/send-task-assigned-email.class';
import { SendTaskCompletedEmailUseCase } from './classes/send-task-completed-email.class';
import { AssignMemberDto } from './dto/assign-member.dto';
import { CreateTaskLabelDto } from './dto/create-task-label.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskList)
    private readonly taskListRepository: Repository<TaskList>,
    private readonly createTaskLabelUseCase: CreateTaskLabelUseCase,
    private readonly deleteTaskLabelUseCase: DeleteTaskLabelUseCase,
    private readonly assignMemberUseCase: AssignMemberUseCase,
    private readonly unassignMemberUseCase: UnassignMemberUseCase,
    private readonly reorderTasksUseCase: ReorderTasksUseCase,
    private readonly sendTaskAssignedEmailUseCase: SendTaskAssignedEmailUseCase,
    private readonly sendTaskCompletedEmailUseCase: SendTaskCompletedEmailUseCase,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const taskList = await this.taskListRepository.findOne({
      where: {
        id: createTaskDto.taskListId,
        board: {
          code: createTaskDto.boardCode,
          workspace: { code: createTaskDto.workspaceCode },
        },
      },
    });
    if (!taskList) throw new NotFoundException('Task list no encontrado');

    const { taskListId: _, workspaceCode, boardCode, ...task } = createTaskDto;
    const $task = this.taskRepository.create({ taskList, ...task });
    const newTask = await this.taskRepository.save($task);
    return this.findOne(newTask.id);
  }

  findAll() {
    return `This action returns all tasks`;
  }

  async findOne(id: number): Promise<ITask> {
    const task = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'taskLabel')
      .leftJoinAndSelect('taskLabel.label', 'label')
      .leftJoinAndSelect('task.assignments', 'assignment')
      .leftJoinAndSelect('assignment.workspaceMember', 'assigneeMember')
      .leftJoinAndSelect('assigneeMember.user', 'assigneeUser')
      .leftJoinAndSelect('assigneeUser.profile', 'assigneeProfile')
      .where('task.id = :id', { id })
      .getOne();
    if (!task) throw new NotFoundException('Tarea no encontrada');
    if (!task.isAvailable) throw new NotFoundException('Tarea no disponible');
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
        photo: profile?.photo ?? null,
        initials: `${firstName.charAt(0)}${firstSurname.charAt(0)}`.toUpperCase(),
        avatarColor: ['#ef4444', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'][
          fullname.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 8
        ],
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
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      labels,
      assignees,
    };
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user?: AuthenticatedUserDto) {
    const entity = await this.taskRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException('Tarea no encontrada');
    if (!entity.isAvailable) throw new NotFoundException('Tarea no disponible');

    if (updateTaskDto.taskListId !== undefined) {
      entity.taskList = { id: updateTaskDto.taskListId } as TaskList;
    }

    const { taskListId, ...rest } = updateTaskDto;
    this.taskRepository.merge(entity, rest);
    await this.taskRepository.save(entity);

    if (!entity.completed && updateTaskDto.completed && user) {
      this.sendTaskCompletedEmailUseCase.execute(id, user.code).catch(() => {});
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const entity = await this.taskRepository.findOneBy({ id });
    if (!entity) throw new NotFoundException('Tarea no encontrada');
    if (!entity.isAvailable) throw new NotFoundException('Tarea no disponible');
    entity.isAvailable = false;
    return this.taskRepository.save(entity);
  }

  async addLabel(taskId: number, dto: CreateTaskLabelDto) {
    await this.createTaskLabelUseCase.execute(taskId, dto);
    return this.findOne(taskId);
  }

  async removeLabel(taskId: number, labelId: number) {
    await this.deleteTaskLabelUseCase.execute(taskId, labelId);
    return this.findOne(taskId);
  }

  async assignMember(taskId: number, dto: AssignMemberDto) {
    await this.assignMemberUseCase.execute(taskId, dto);
    this.sendTaskAssignedEmailUseCase.execute(dto.workspaceMemberId, taskId).catch(() => {});
    return this.findOne(taskId);
  }

  async unassignMember(taskId: number, assignmentId: number) {
    await this.unassignMemberUseCase.execute(assignmentId);
    return this.findOne(taskId);
  }

  async reorder(dto: ReorderTasksDto): Promise<void> {
    await this.reorderTasksUseCase.execute(dto);
  }
}
