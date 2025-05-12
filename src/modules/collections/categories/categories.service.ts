import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  async findAll() {
    const categories = await this.categoryModel.find().exec();

    return {
      message: 'success',
      data: categories,
    };
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
    }

    return {
      message: 'Thành công',
      data: category,
    };
  }

  async getProductsOfCategory(id: string, query: any) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục`);
    }

    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const name = query.name?.trim();
    const isStock = query.is_stock;
    const isFeatured = query.is_featured;
    const sort = query.sort;

    const filter: any = {
      cat_id: new Types.ObjectId(id),
    };

    // Lọc theo tên
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Lọc theo tồn kho
    if (isStock !== undefined) {
      filter.is_stock = isStock === 'true';
    }

    // Lọc theo nổi bật
    if (isFeatured !== undefined) {
      filter.featured = isFeatured === 'true';
    }

    // Lọc theo giá tối đa
    if (query['price[$lte]']) {
      const priceLimit = parseFloat(query['price[$lte]']);
      if (!isNaN(priceLimit)) {
        filter.price = { $lte: priceLimit };
      }
    }

    // Sắp xếp
    let sortObj: any = {};
    if (sort === '-createdAt') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'createdAt') {
      sortObj = { createdAt: 1 };
    }

    const total = await this.productModel.countDocuments(filter);
    const docs = await this.productModel
      .find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Lấy sản phẩm thành công',
      data: {
        docs,
        pages: {
          total,
          limit,
          currentPage: page,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          next: page < totalPages ? page + 1 : null,
          prev: page > 1 ? page - 1 : null,
          keyword: name || null,
        },
      },
    };
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
