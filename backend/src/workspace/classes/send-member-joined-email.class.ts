export abstract class SendMemberJoinedEmailUseCase {
  abstract execute(workspaceCode: string, newMemberCode: string): Promise<void>;
}
