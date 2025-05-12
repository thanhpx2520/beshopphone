import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CommentsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, ProductsModule, MongooseModule],
})
export class ProductsModule {}
