export abstract class SendTaskAssignedEmailUseCase {
  abstract execute(workspaceMemberId: number, taskId: number): Promise<void>;
}
