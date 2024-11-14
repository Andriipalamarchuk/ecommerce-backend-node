import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '../entities/cart.entity';
import { Repository } from 'typeorm';
import { IProductCart } from '../../products/interfaces/product.interface';
import { Decimal } from 'decimal.js';
import { ICart } from '../interfaces/cart.interface';
import { ProductCartEntity } from '../entities/product-cart.entity';
import { DiscountEnum } from '../../discounts/enums/discount.enum';

@Injectable()
export class CartsRepository {
  constructor(
    @InjectRepository(CartEntity)
    private readonly _cartRepo: Repository<CartEntity>,
    @InjectRepository(ProductCartEntity)
    private readonly _productCartRepo: Repository<ProductCartEntity>,
  ) {}

  public static mapCartEntityToCart(cartEntity?: CartEntity): ICart | null {
    if (!cartEntity) {
      return null;
    }
    const products = (cartEntity.productCart || []).map((productCartEntity) =>
      CartsRepository.mapProductCartEntityToProductCart(productCartEntity),
    );
    let total = new Decimal(0);
    for (const product of products) {
      total = total.plus(product.subtotal);
    }
    const originalPrice = new Decimal(total);

    if (cartEntity.discount) {
      const { discount } = cartEntity;
      switch (discount.type) {
        case DiscountEnum.ABSOLUTE:
          total = total.minus(discount.value);
          break;
        case DiscountEnum.PERCENTAGE:
          total = total.minus(new Decimal(total).div(100).mul(discount.value));
          break;
      }
    }

    return {
      id: cartEntity.id,
      originalPrice: originalPrice.toNumber(),
      products,
      total: total.toNumber(),
    };
  }

  public static mapProductCartEntityToProductCart(
    productCartEntity: ProductCartEntity,
  ): IProductCart {
    const subtotal = new Decimal(productCartEntity.product.price).mul(
      productCartEntity.quantity,
    );

    return {
      id: productCartEntity.productId,
      price: productCartEntity.product.price,
      quantity: productCartEntity.quantity,
      subtotal: subtotal.toNumber(),
    };
  }

  public async addToCart(
    cartId: number,
    productId: number,
    quantity: number,
  ): Promise<IProductCart> {
    await this._productCartRepo.insert({
      cartId,
      productId,
      quantity,
    });

    const product = await this.getUserProductInCart(productId, cartId);
    return CartsRepository.mapProductCartEntityToProductCart(product);
  }

  public async getProductInCartQuantity(productId: number): Promise<number> {
    const result = await this._productCartRepo
      .createQueryBuilder('productCart')
      .select('SUM(productCart.quantity)', 'totalQuantity')
      .where('productCart.productId = :productId', { productId })
      .getRawOne();

    return result ? Number(result.totalQuantity) : 0;
  }

  public async getUserProductInCart(
    productId: number,
    cartId: number,
  ): Promise<ProductCartEntity | null> {
    return await this._productCartRepo.findOne({
      relations: { product: true },
      where: { productId, cartId },
    });
  }

  public async getUserCart(userId: number): Promise<ICart> {
    const userCartEntity = await this._cartRepo.findOne({
      relations: { productCart: { product: true }, discount: true },
      where: { userId },
    });

    return CartsRepository.mapCartEntityToCart(userCartEntity);
  }

  public async updateProductInCart(
    cartId: number,
    productId: number,
    quantity: number,
  ): Promise<IProductCart> {
    await this._productCartRepo.update({ cartId, productId }, { quantity });

    const entity = await this.getUserProductInCart(productId, cartId);
    return CartsRepository.mapProductCartEntityToProductCart(entity);
  }

  public async deleteProductFromCart(
    productId: number,
    cartId: number,
  ): Promise<void> {
    await this._productCartRepo.delete({ productId, cartId });
  }

  public async createCart(userId: number): Promise<ICart> {
    const saveResult = await this._cartRepo.save({ userId });
    return CartsRepository.mapCartEntityToCart(saveResult);
  }

  public async applyDiscountToCart(
    cartId: number,
    discountId: number,
  ): Promise<void> {
    await this._cartRepo.update({ id: cartId }, { discountId });
  }
}
