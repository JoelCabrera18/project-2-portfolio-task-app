export abstract class SendMemberRemovedEmailUseCase {
  abstract execute(memberId: number): Promise<void>;
}
