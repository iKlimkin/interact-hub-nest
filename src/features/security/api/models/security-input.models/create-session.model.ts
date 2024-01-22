import {
  IsObject,
  IsDefined,
  IsString,
  IsNotEmpty,
  IsIP,
  IsOptional,
} from 'class-validator';
import { Details } from 'express-useragent';
import { JwtPayload } from 'jsonwebtoken';

export class InputSessionDataValidator {
  @IsObject()
  @IsDefined()
  userPayload: JwtPayload;

  @IsString()
  @IsNotEmpty()
  @IsIP()
  ip: string;

  @IsString()
  @IsNotEmpty()
  browser: string;

  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @IsObject()
  @IsOptional()
  userAgentInfo: Details 

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
