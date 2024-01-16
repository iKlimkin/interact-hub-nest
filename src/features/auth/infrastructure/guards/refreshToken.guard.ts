import { ExecutionContext, Injectable } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
//   handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
//     if (info instanceof TokenExpiredError) {
//       console.log('token expired');
//     }

//     return user;
//   }
}
