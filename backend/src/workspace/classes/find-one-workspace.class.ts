import { IWorkspace } from '../interfaces/workspace-response.interface';

export abstract class FindOneWorkspaceUseCase {
  abstract execute(workpaceCode: string, userId?: number): Promise<IWorkspace | null>;
}
