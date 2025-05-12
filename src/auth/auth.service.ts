import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/require-await
  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Thay bằng truy vấn thực tế vào DB
    if (email === 'admin@gmail.com' && password === '123456') {
      return { id: 1, email: 'admin@example.com', name: 'Admin' };
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: any) {
    return {
      success: true,
      message: 'Login thành công',
    };
  }
}
