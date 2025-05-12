import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SliderDocument = HydratedDocument<Slider>;

@Schema({ collection: 'sliders', timestamps: true })
export class Slider {
  @Prop()
  image: string;

  @Prop()
  position: number;

  @Prop()
  public: boolean;
}

export const SliderSchema = SchemaFactory.createForClass(Slider);
