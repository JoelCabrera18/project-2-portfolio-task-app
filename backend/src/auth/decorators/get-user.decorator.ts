import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const { user } = req;
  if (!user) throw new InternalServerErrorException('No user found in request');
  return user;
});
