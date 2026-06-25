import { TaskAssignment } from '../entities/task-assignment.entity';
import { AssignMemberDto } from '../dto/assign-member.dto';

export abstract class AssignMemberUseCase {
  abstract execute(taskId: number, dto: AssignMemberDto): Promise<TaskAssignment>;
}
