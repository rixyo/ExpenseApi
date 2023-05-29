import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface userType {
  id: string;
  name: string;
  iat: number;
  exp: number;
}

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user as userType;
});
