import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../entities/product.entity';
import { MoreThan, Repository } from 'typeorm';
import { IProduct } from '../interfaces/product.interface';
import { AddProductDto } from '../dtos/add-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly _repository: Repository<ProductEntity>,
  ) {}

  public async getProduct(id: number): Promise<IProduct | null> {
    return await this._repository.findOne({ where: { id } });
  }

  public async getProducts(
    page: number,
    pageSize: number,
  ): Promise<IProduct[]> {
    return this._repository.find({
      take: pageSize,
      skip: page * pageSize,
      where: { availableQuantity: MoreThan(0) },
    });
  }

  public async addProduct(addProductDto: AddProductDto): Promise<IProduct> {
    return await this._repository.save(addProductDto);
  }
}
