import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Model } from 'mongoose';
import { SecurityDeviceType } from './api/models/security.view.models/security.view.types';
import { InputSessionData } from './api/models/security-input.models/create.session.type';

@Schema()
export class Security extends Document implements SecurityDeviceType {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  issuedAt: string;

  @Prop({ required: true })
  expirationDate: string;

  static makeInstance(dto: InputSessionData): SecurityDeviceType {
    const security = new Security();
    security.ip = dto.ip;
    security.title = `Device type: ${dto.deviceType}, Application: ${dto.browser}`;
    security.userId = dto.userId;
    security.deviceId = dto.userInfo.deviceId;
    security.refreshToken = dto.refreshToken;
    security.issuedAt = new Date(dto.userInfo.iat! * 1000).toISOString();
    security.expirationDate = new Date(dto.userInfo.exp! * 1000).toISOString();

    return security;
  }
}

export const SecuritySchema = SchemaFactory.createForClass(Security);

export type SecurityDocument = HydratedDocument<Security>;
export type SecurityModelType = Model<SecurityDocument> &
  SecurityModelStaticType;
export type SecurityModelDocumentType = Model<SecurityDocument>;

export type SecurityModelStaticType = {
  makeInstance(dto: InputSessionData): SecurityDeviceType;
};

export const SecurityStaticMethods: SecurityModelStaticType = {
  makeInstance: Security.makeInstance,
};
