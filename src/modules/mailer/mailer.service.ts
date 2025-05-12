import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailersService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService, // Cấu hình được inject vào service
  ) {}

  public async registerVerify(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email, // Dùng email của user thay vì cố định
        subject: 'Đăng ký tài khoản thành công !',
        template: 'email-verify-account',
        context: {
          host: this.configService.get<string>('HOST') || 'localhost', // Sửa lỗi gọi configService
          port: this.configService.get<number>('PORT') || 7000, // PORT nên lấy kiểu số
          email,
          name,
          code,
        },
      });
      console.log('Gửi email thành công !');
    } catch (error) {
      console.error('Có lỗi xảy ra khi gửi email !', error);
    }
  }

  public async orderSuccess(customer: {
    full_name: string;
    email: string;
    address: string;
    phone_number: string;
    items: { name: string; qty: number; price: number }[]; // ⚠️ Đổi `prd_id` => `name`
    totalPrice: number;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: customer.email,
        subject: 'Đặt hàng thành công!',
        template: 'order-success',
        context: {
          name: customer.full_name,
          email: customer.email,
          address: customer.address,
          phone: customer.phone_number,
          items: customer.items, // items đã có tên sản phẩm
          total: customer.totalPrice,
        },
      });
      console.log('Gửi mail xác nhận đơn hàng thành công');
    } catch (error) {
      console.error('Gửi mail đơn hàng thất bại:', error);
    }
  }
}
