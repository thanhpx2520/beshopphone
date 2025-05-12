import { Module } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { SlidersController } from './sliders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Slider, SliderSchema } from './schemas/slider.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Slider.name, schema: SliderSchema }]),
  ],
  controllers: [SlidersController],
  providers: [SlidersService],
})
export class SlidersModule {}
