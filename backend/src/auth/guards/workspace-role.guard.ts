import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from 'src/workspace/entities/workspace-member.entity';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import { WorkspaceRole } from 'src/workspace/interfaces/workspace-response.interface';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('User not found in request');

    const workspaceCode =
      request.params.workspaceCode ??
      request.params.code ??
      request.body?.workspaceCode ??
      request.query.ws;

    if (!workspaceCode) throw new ForbiddenException('Workspace code is required');

    const membership = await this.workspaceMemberRepository.findOne({
      where: {
        workspace: { code: workspaceCode },
        user: { id: user.id },
        isAvailable: true,
      },
    });

    if (!membership) throw new ForbiddenException('You are not a member of this workspace');

    if (!requiredRoles.includes(membership.roleMember as WorkspaceRole)) {
      throw new ForbiddenException(
        `Insufficient role. Required: ${requiredRoles.join(' or ')}. Your role: ${membership.roleMember}`,
      );
    }

    return true;
  }
}
