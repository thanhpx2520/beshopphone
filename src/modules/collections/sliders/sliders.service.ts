import { Injectable } from '@nestjs/common';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slider } from './schemas/slider.schema';

@Injectable()
export class SlidersService {
  constructor(@InjectModel(Slider.name) private sliderModel: Model<Slider>) {}

  create(createSliderDto: CreateSliderDto) {
    return 'This action adds a new slider';
  }

  async findAll() {
    const sliders = await this.sliderModel.find().exec();

    return {
      message: 'success',
      data: sliders,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} slider`;
  }

  update(id: number, updateSliderDto: UpdateSliderDto) {
    return `This action updates a #${id} slider`;
  }

  remove(id: number) {
    return `This action removes a #${id} slider`;
  }
}
