import { ReorderTasksDto } from '../dto/reorder-tasks.dto';

export abstract class ReorderTasksUseCase {
  abstract execute(dto: ReorderTasksDto): Promise<void>;
}
