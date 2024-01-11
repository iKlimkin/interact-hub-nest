export interface SecurityInterface {
  getUserActiveSessions(res: any): Promise<void>;
  terminateOtherUserSessions(res: any): Promise<boolean>;
  terminateSpecificSession(deviceId: string, res: any): Promise<void>;
  // getRequestApiLogs(): Promise<void>;
}
