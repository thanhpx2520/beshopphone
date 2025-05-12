import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();

    // Lấy cookie 'statusLogin' từ request
    const cookie = request.cookies['statusLogin'];

    if (!cookie) {
      // Nếu không có cookie, chuyển hướng đến trang login
      response.redirect('/admin/login');
      return false; // Trả về false để dừng quá trình xử lý tiếp
    }

    if (cookie !== 'success') {
      // Nếu cookie không hợp lệ, chuyển hướng đến trang login
      response.redirect('/admin/login');
      return false; // Dừng quá trình xử lý
    }

    return true; // Nếu có cookie hợp lệ, cho phép truy cập vào route
  }
}
