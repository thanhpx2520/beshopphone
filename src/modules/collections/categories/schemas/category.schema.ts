import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ collection: 'categories', timestamps: true })
export class Category {
  @Prop()
  description: string;

  @Prop()
  title: string;

  @Prop()
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
