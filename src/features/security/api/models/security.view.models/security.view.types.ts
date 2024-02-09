export type SecurityDeviceModel = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  expirationDate: string;
};

export type SecurityViewDeviceModel = Omit<
  SecurityDeviceModel,
  'expirationDate'
>;

// export type SessionSqlViewModel = Omit<
//   SecurityDeviceModel,
//   'expirationDate'
// >;

export type SecurityDeviceType = {
  ip: string;
  title: string;
  userId: string;
  deviceId: string;
  refreshToken: string;
  issuedAt: string;
  expirationDate: string;
};

export interface UserSQLSession {
  id: string;
  ip: string;
  title: string;
  user_id: string;
  device_id: string;
  refresh_token: string;
  rt_issued_at: Date;
  rt_expiration_date: Date;
  created_at: Date;
}

export interface UserSQLSessionDTO extends Omit<UserSQLSession, 'created_at' | 'id'> {}