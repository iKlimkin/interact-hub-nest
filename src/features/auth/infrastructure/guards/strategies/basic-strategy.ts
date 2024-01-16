import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { basicConstants } from 'src/features/auth/infrastructure/guards/constants';

@Injectable()
export class BasicSAStrategy extends PassportStrategy(BasicStrategy) {
  constructor() {
    super();
  }

  public validate = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    if (
      basicConstants.userName === username &&
      basicConstants.userPassword === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
