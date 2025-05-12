import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop()
  full_name: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'Auth', required: true })
  customer_id: Types.ObjectId;

  @Prop([
    {
      prd_id: { type: Types.ObjectId, ref: 'Product', required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
    },
  ])
  items: {
    prd_id: Types.ObjectId;
    price: number;
    qty: number;
  }[];

  @Prop({ default: 1 })
  status: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
