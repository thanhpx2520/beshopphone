import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './schemas/auth.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from 'src/modules/collections/orders/schemas/order.schema';
import { FastifyReply } from 'fastify';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auths`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async register(dto: RegisterAuthDto) {
    const existingUser = await this.authModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const user = new this.authModel({ ...dto });
    await user.save();

    return { message: 'User registered successfully' };
  }

  async login(dto: LoginAuthDto) {
    const user = await this.authModel.findOne({ email: dto.email });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.password === dto.password && user.role === 'member') {
      return { user };
    }

    throw new BadRequestException('Sai tài khoản hoặc mật khẩu !');
  }

  async getOrderByCustomerId(customerId: string, query) {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const total = await this.orderModel.countDocuments({
      customer_id: new Types.ObjectId(customerId),
    });
    const orders = await this.orderModel
      .find({
        customer_id: new Types.ObjectId(customerId),
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const totalPages = Math.ceil(total / limit);
    return {
      data: {
        docs: orders,
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

  async updateUserByInfor(id: string, data: any) {
    const updated = await this.authModel.findByIdAndUpdate(id, data);

    return 'update customer successfully';
  }

  async adminLogin(data: any, res: FastifyReply) {
    const admin = await this.authModel.findOne({ email: data.email });

    if (admin?.password === data.password) {
      console.log('✅ Đăng nhập thành công');
      return res.redirect('/admin/dashboard'); // cần ghi rõ status code
    }

    console.log('❌ Đăng nhập thất bại');
    return res.redirect('/admin/login?error=invalid');
  }
}
