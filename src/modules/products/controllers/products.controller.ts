import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { IProduct } from '../interfaces/product.interface';
import { AddProductDto } from '../dtos/add-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}

  @Get()
  public async getProducts(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
  ): Promise<IProduct[]> {
    if (!!page || !!pageSize) {
      throw new BadRequestException('Page and Page size should be provided');
    }

    return await this._productsService.getProducts(page, pageSize);
  }

  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Post()
  public async addProduct(
    @Body() addProductDto: AddProductDto,
  ): Promise<IProduct> {
    if (addProductDto.price <= 0) {
      throw new BadRequestException('Invalid product price');
    }

    if (addProductDto.availableQuantity < 0) {
      throw new BadRequestException('Invalid product available quantity');
    }

    return await this._productsService.addProduct(addProductDto);
  }
}
