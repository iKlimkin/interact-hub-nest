import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Model } from 'mongoose';

@Schema()
export class RequestCounter extends Document {
  @Prop({ required: true, type: String })
  ip: string;

  @Prop({ required: true, type: String })
  url: string;

  @Prop({ type: Date })
  timestamp: Date;
}

export const ApiRequestCounterSchema =
  SchemaFactory.createForClass(RequestCounter);

export type ApiRequestDocument = HydratedDocument<RequestCounter>;
export type ApiRequestModelType = Model<ApiRequestDocument>;
