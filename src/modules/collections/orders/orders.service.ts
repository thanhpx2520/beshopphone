import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model, Types } from 'mongoose';
import { MailersService } from 'src/modules/mailer/mailer.service';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly mailerService: MailersService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // 1. Tạo đơn hàng
    const createdOrder = new this.orderModel({
      ...createOrderDto,
      customer_id: new Types.ObjectId(createOrderDto.customer_id),
      items: createOrderDto.items.map((item) => ({
        ...item,
        prd_id: new Types.ObjectId(item.prd_id),
      })),
    });

    await createdOrder.save();

    // 2. Populate thông tin sản phẩm
    const populatedItems = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const product = await this.productModel.findById(item.prd_id).lean();
        return {
          name: product?.name || 'Sản phẩm không xác định',
          thumbnail:
            product?.thumbnail || product?.name || 'Sản phẩm không xác định',
          qty: item.qty,
          price: item.price,
        };
      }),
    );

    // 3. Gửi email
    await this.mailerService.orderSuccess({
      full_name: createOrderDto.full_name,
      email: createOrderDto.email,
      address: createOrderDto.address,
      phone_number: createOrderDto.phone_number,
      items: populatedItems,
      totalPrice: createOrderDto.totalPrice,
    });

    return createdOrder;
  }

  findAll() {
    return `This action returns all orders`;
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).populate('items.prd_id');

    return { data: { docs: order } };
  }

  async canceledOrder(id: string) {
    const canceled = await this.orderModel.findByIdAndUpdate(id, { status: 0 });
    return {
      data: 'canceles success',
    };
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
