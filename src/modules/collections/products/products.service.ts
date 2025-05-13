import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { Comment } from '../comments/schemas/comment.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async getAll(query: any) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const name = query.name?.trim();
    const isStock = query.is_stock;
    const isFeatured = query.is_featured;
    const sort = query.sort;

    const filter: any = {};

    // Lọc theo tên sản phẩm
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Lọc theo trạng thái tồn kho
    if (isStock !== undefined) {
      filter.is_stock = isStock === 'true';
    }

    // Lọc theo trạng thái nổi bật
    if (isFeatured !== undefined) {
      filter.featured = isFeatured === 'true';
    }

    // Lọc theo giá tối đa (price[$lte])
    if (query['price[$lte]']) {
      const priceLimit = parseFloat(query['price[$lte]']);
      if (!isNaN(priceLimit)) {
        filter.price = { $lte: priceLimit };
      }
    }

    // Sắp xếp theo ngày tạo (createdAt)
    let sortObj: any = {};
    if (sort === '-createdAt') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'createdAt') {
      sortObj = { createdAt: 1 };
    }

    // Tính toán tổng số sản phẩm và phân trang
    const total = await this.productModel.countDocuments(filter);
    const docs = await this.productModel
      .find(filter)
      .sort(sortObj)
      .populate('cat_id')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
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

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const related = await this.productModel.aggregate([
      {
        $match: {
          cat_id: product.cat_id,
          _id: { $ne: product._id },
        },
      },
      {
        $sample: { size: 3 },
      },
    ]);

    console.log(product, related);

    return { product, related };
  }

  async findCommentById(
    productId: string,
    page: number = 1,
    limit: number = 5,
  ) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new NotFoundException('Invalid product ID');
    }

    const filter = { prd_id: new Types.ObjectId(productId) };

    const total = await this.commentModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const comments = await this.commentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: {
        docs: comments,
        pages: {
          total,
          limit,
          currentPage: page,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          next: page < totalPages ? page + 1 : null,
          prev: page > 1 ? page - 1 : null,
        },
      },
    };
  }

  async createComment(id: string, body: any) {
    const data = { ...body, prd_id: new Types.ObjectId(id) };

    const createdComment = await this.commentModel.create(data);
    return { status: 'success' };
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
