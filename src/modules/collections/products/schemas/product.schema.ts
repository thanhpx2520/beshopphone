import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop()
  thumbnail: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  cat_id: Types.ObjectId;

  @Prop()
  status: string;

  @Prop()
  featured: boolean;

  @Prop()
  promotion: string;

  @Prop()
  warranty: string;

  @Prop()
  accessories: string;

  @Prop()
  is_stock: boolean;

  @Prop()
  name: string;

  @Prop()
  slug: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
