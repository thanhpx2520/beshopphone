import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiV1Controller } from 'src/base.controller';

// @Controller('products')
@ApiV1Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.productsService.getAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Get(':id/comments')
  getComments(
    @Param('id') id: string,
    @Query('pageComment') page: number,
    @Query('limit') limit: number,
  ) {
    return this.productsService.findCommentById(id, page, limit);
  }

  @Post(':id/comments')
  createCo(@Param('id') id: string, @Body() body: any) {
    return this.productsService.createComment(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
