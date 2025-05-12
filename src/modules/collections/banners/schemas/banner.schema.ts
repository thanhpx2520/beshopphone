import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ collection: 'banners', timestamps: true })
export class Banner {
  @Prop()
  image: string;

  @Prop()
  position: number;

  @Prop()
  url: string;

  @Prop()
  public: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
