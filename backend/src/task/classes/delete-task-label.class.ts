export abstract class DeleteTaskLabelUseCase {
  abstract execute(taskId: number, labelId: number): Promise<void>;
}
