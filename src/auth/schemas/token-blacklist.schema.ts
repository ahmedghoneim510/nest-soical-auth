import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TokenBlacklist extends Document {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true, type: Date, expires: '7d' })
  expiresAt: Date;
}

export const TokenBlacklistSchema =
  SchemaFactory.createForClass(TokenBlacklist);
