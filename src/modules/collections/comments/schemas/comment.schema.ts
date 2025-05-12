import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ collection: 'comments', timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  prd_id: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  body: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
