import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Model } from 'mongoose';

export type TempAccountDocument = HydratedDocument<TempUserAccount>;
export type TempUserAccountModelType = Model<TempAccountDocument>;

@Schema()
export class TempUserAccount extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  recoveryCode: string;

  @Prop({ required: true })
  expirationDate: string;
}

export const TempUserAccountSchema =
  SchemaFactory.createForClass(TempUserAccount);
