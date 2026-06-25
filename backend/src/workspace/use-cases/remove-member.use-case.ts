import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { RemoveMemberUseCase } from '../classes/remove-member.class';
import { AuthenticatedUserDto } from 'src/auth/dto/authenticated-user.dto';

@Injectable()
export class RemoveMemberUseCaseImp implements RemoveMemberUseCase {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async execute(workspaceId: number, memberId: number, user: AuthenticatedUserDto): Promise<void> {
    const member = await this.workspaceMemberRepository.findOne({
      where: { id: memberId, workspace: { id: workspaceId } },
      relations: { workspace: true },
    });

    if (!member) throw new NotFoundException('Member not found');
    if (!member.isAvailable) throw new NotFoundException('Member not available');

    const owner = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: user.id }, roleMember: 'owner' },
    });

    if (!owner) throw new ForbiddenException('Only workspace owners can remove members');
    if (member.roleMember === 'owner') throw new ForbiddenException('Cannot remove the workspace owner');
    if (member.id === owner.id) throw new ForbiddenException('Cannot remove yourself');

    member.isAvailable = false;
    member.departureDate = new Date();
    await this.workspaceMemberRepository.save(member);
  }
}
