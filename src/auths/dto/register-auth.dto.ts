import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterAuthDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  full_name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone_number: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;
}
