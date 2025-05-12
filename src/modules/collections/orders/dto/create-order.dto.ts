import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  prd_id: string;

  @IsNumber()
  price: number;

  @IsNumber()
  qty: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customer_id: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @IsArray()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
