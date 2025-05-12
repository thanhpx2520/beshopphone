import { Injectable } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner } from './schemas/banner.schema';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<Banner>) {}

  create(createBannerDto: CreateBannerDto) {
    return 'This action adds a new banner';
  }

  async findAll() {
    const banners = await this.bannerModel.find().exec();

    return {
      message: 'success',
      data: banners,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} banner`;
  }

  update(id: number, updateBannerDto: UpdateBannerDto) {
    return `This action updates a #${id} banner`;
  }

  remove(id: number) {
    return `This action removes a #${id} banner`;
  }
}
