import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '../entities/cart.entity';
import { Repository } from 'typeorm';
import { IProductCart } from '../../products/interfaces/product.interface';
import { Decimal } from 'decimal.js';

@Injectable()
export class CartsRepository {
  constructor(
    @InjectRepository(CartEntity)
    private readonly _repository: Repository<CartEntity>,
  ) {}

  public static mapCartEntityToProductCart(
    cartEntity?: CartEntity,
  ): IProductCart | null {
    if (!cartEntity?.product) {
      return null;
    }

    const subtotal = new Decimal(cartEntity.product.price);

    return {
      id: cartEntity.productId,
      price: cartEntity.product.price,
      quantity: cartEntity.quantity,
      subtotal: subtotal.mul(cartEntity.quantity).toNumber(),
    };
  }

  public async addToCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<IProductCart> {
    await this._repository.insert({
      userId,
      productId,
      quantity,
    });

    const product = await this.getUserProductInCart(productId, userId);
    return CartsRepository.mapCartEntityToProductCart(product);
  }

  public async getProductInCartQuantity(productId: number): Promise<number> {
    const result = await this._repository
      .createQueryBuilder('cart')
      .select('SUM(cart.quantity)', 'totalQuantity')
      .where('cart.productId = :productId', { productId })
      .getRawOne();

    return result ? Number(result.totalQuantity) : 0;
  }

  public async getUserProductInCart(
    productId: number,
    userId: number,
  ): Promise<CartEntity | null> {
    return await this._repository.findOne({
      relations: { product: true },
      where: { productId, userId },
    });
  }

  public async getProductsInCart(userId: number): Promise<IProductCart[]> {
    const productCartEntities = await this._repository.find({
      relations: { product: true },
      where: { userId },
    });

    return productCartEntities.map((entity) =>
      CartsRepository.mapCartEntityToProductCart(entity),
    );
  }

  public async updateProductInCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<IProductCart> {
    await this._repository.update({ userId, productId }, { quantity });

    const entity = await this.getUserProductInCart(productId, userId);
    return CartsRepository.mapCartEntityToProductCart(entity);
  }

  public async deleteProductFromCart(
    productId: number,
    userId: number,
  ): Promise<void> {
    await this._repository.delete({ productId, userId });
  }
}
