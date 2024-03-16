import { JwtPayload } from 'jsonwebtoken';

export class UserSessionDto {
  ip: string;
  user_agent_info: string;
  user_id: string;
  device_id: string;
  refresh_token: string;
  rt_issued_at: Date;
  rt_expiration_date: Date;

  constructor(
    ip: string,
    user_agent_info: string,
    userId: string,
    userPayload: JwtPayload,
    refreshToken: string,
  ) {
    this.ip = ip;
    this.user_agent_info = user_agent_info;
    this.user_id = userId;
    this.device_id = userPayload.deviceId;
    this.refresh_token = refreshToken;
    this.rt_issued_at = new Date(userPayload.iat! * 1000);
    this.rt_expiration_date = new Date(userPayload.exp! * 1000);
  }
}

type UserPayloadType = {
  deviceId: string;
  iat: string;
  exp: string;
};

type CreateUserSessionSqlType = {
  ip: string;
  user_agent_info: string;
  user_id: string;
  device_id: string;
  refresh_token: string;
  rt_issued_at: Date;
  rt_expiration_date: Date;
};
