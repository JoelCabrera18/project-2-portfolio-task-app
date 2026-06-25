import { Label } from '../entities/label.entity';

export abstract class FindLabelsByWorkspaceUseCase {
  abstract execute(workspaceCode: string): Promise<Label[]>;
}
