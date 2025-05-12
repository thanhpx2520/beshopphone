import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    ProductsModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [MongooseModule, CategoriesService],
})
export class CategoriesModule {}
