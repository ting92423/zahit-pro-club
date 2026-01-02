import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('public/products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  async list() {
    return { data: await this.products.list() };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return { data: await this.products.get(id) };
  }
}
