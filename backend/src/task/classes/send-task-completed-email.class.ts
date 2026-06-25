export abstract class SendTaskCompletedEmailUseCase {
  abstract execute(taskId: number, completedByCode: string): Promise<void>;
}
