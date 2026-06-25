export abstract class DeleteTaskListUseCase {
  abstract execute(id: number): Promise<void>;
}
