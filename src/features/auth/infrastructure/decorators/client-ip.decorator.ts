import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetClientInfo = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const forwardedIpsStr =
      request.headers['x-forwarded-for'] || request.socket.remoteAddress || '';
    const ip = (forwardedIpsStr as string).split(',')[0];
    const userAgentInfo = request.useragent;

    return { ip, userAgentInfo };
  },
);
