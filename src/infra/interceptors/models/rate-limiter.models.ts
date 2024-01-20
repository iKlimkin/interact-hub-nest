import { WithId } from 'mongodb';

export { Document } from 'mongoose';

export interface RequestLogs extends Document {
  ip: string;
  url: string;
  timestamp: Date;
  sessionData: any;
}

export type RequestDBLogs = WithId<RequestLogs>;

export type MatchApiType = {
  ip?: string;
  url: string;
  timestamp: Date;
};

export type MatchApiLimitType = {
  ip?: string;
  url: string;
  limitTime: Date;
};
