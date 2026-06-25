export abstract class UnassignMemberUseCase {
  abstract execute(assignmentId: number): Promise<void>;
}
