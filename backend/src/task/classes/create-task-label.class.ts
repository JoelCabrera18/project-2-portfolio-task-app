import { TaskLabel } from '../entities/task-label.entity';
import { CreateTaskLabelDto } from '../dto/create-task-label.dto';

export abstract class CreateTaskLabelUseCase {
  abstract execute(taskId: number, dto: CreateTaskLabelDto): Promise<TaskLabel>;
}
