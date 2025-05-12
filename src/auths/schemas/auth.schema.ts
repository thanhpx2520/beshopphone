import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ collection: 'users', timestamps: true })
export class Auth {
  @Prop()
  full_name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone_number: string;

  @Prop()
  address: string;

  @Prop({ default: 'member' })
  role: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
