import { MatchApiType } from "../../../../../infra/interceptors/models/rate-limiter.models";
import { UserInfoType } from "../../../../auth/api/models/user-models";

import { SecurityViewDeviceModel } from "../security.view.models/security.view.types";


export interface SecurityInterface {
  getUserActiveSessions(
    userInfo: UserInfoType,
  ): Promise<SecurityViewDeviceModel[]>;
  terminateOtherUserSessions(userInfo: UserInfoType): Promise<void>;
  terminateSpecificSession(
    deviceId: string,
    userInfo: UserInfoType,
  ): Promise<void>;
  getRequestApiLogs(): Promise<MatchApiType[]>;
}
