import { WithId } from 'mongodb';
import {
  SecurityDeviceType,
  SecurityViewDeviceModel,
  UserSQLSession,
} from './security.view.types';

export type SecurityDBType = WithId<SecurityDeviceType>;

export const getSecurityViewModel = (
  session: SecurityDBType,
): SecurityViewDeviceModel => ({
  ip: session.ip,
  title: session.title,
  lastActiveDate: session.issuedAt,
  deviceId: session.deviceId,
});

export const getSqlSessionViewModel = (
  session: UserSQLSession,
): SecurityViewDeviceModel => ({
  ip: session.ip,
  title: session.title,
  lastActiveDate: session.rt_issued_at.toString(),
  deviceId: session.device_id,
});
