import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { IProduct } from '../interfaces/product.interface';
import { Cacheable } from '@type-cacheable/core';
import { TimeInSecond } from '../../../enums/time-in-seconds.enum';
import { HashKey } from '../../../enums/hash-key.enum';
import { AddProductDto } from '../dtos/add-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly _productsRepository: ProductsRepository) {}

  @Cacheable({
    cacheKey: (args: any[]) => `${args[0]}`,
    ttlSeconds: TimeInSecond.ONE_HOUR,
    hashKey: HashKey.PRODUCT,
  })
  public async getProduct(id: number): Promise<IProduct> {
    const product = await this._productsRepository.getProduct(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  @Cacheable({
    cacheKey: (args: any[]) => `page_${args[0]}_pageSize_${args[1]})}`,
    ttlSeconds: TimeInSecond.ONE_DAY,
    hashKey: HashKey.PRODUCTS,
  })
  public async getProducts(
    page: number,
    pageSize: number,
  ): Promise<IProduct[]> {
    return await this._productsRepository.getProducts(page, pageSize);
  }

  public async addProduct(addProductDto: AddProductDto): Promise<IProduct> {
    return await this._productsRepository.addProduct(addProductDto);
  }
}
