import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CartsRepository } from '../repositories/carts.repository';
import { ICart } from '../interfaces/cart.interface';
import { ProductsService } from '../../products/services/products.service';
import { IProductCart } from '../../products/interfaces/product.interface';
import { Decimal } from 'decimal.js';
import { ProductToCartDto } from '../dtos/product-to-cart.dto';
import { Cacheable, CacheClear } from '@type-cacheable/core';
import { TimeInSecond } from '../../../enums/time-in-seconds.enum';
import { HashKey } from '../../../enums/hash-key.enum';

@Injectable()
export class CartsService {
  constructor(
    private readonly _cartsRepository: CartsRepository,
    private readonly _productsService: ProductsService,
  ) {}

  @CacheClear({
    hashKey: HashKey.CART,
    cacheKey: (args: any[]) => `user_${args[1]}`,
  })
  public async addProductToCart(
    productToCartDto: ProductToCartDto,
    userId: number,
  ): Promise<IProductCart> {
    const product = await this._productsService.getProduct(
      productToCartDto.productId,
    );
    if (!product.availableQuantity) {
      throw new ConflictException('Product is not available');
    }
    //TODO: Define with stakeholder how to manage products already in cart of somebody
    //For example can be "locked" by defined time
    const productsAlreadyInCart =
      await this._cartsRepository.getProductInCartQuantity(
        productToCartDto.productId,
      );

    const isProductAlreadyInUserCart =
      await this._cartsRepository.getUserProductInCart(
        productToCartDto.productId,
        userId,
      );

    const availableQuantityToAdd =
      product.availableQuantity -
      (productsAlreadyInCart - (isProductAlreadyInUserCart?.quantity || 0));

    if (isProductAlreadyInUserCart) {
      const newQuantity =
        productToCartDto.quantity + isProductAlreadyInUserCart.quantity >
        availableQuantityToAdd
          ? availableQuantityToAdd
          : productToCartDto.quantity + isProductAlreadyInUserCart.quantity;

      Logger.debug(
        `Product id: ${product.id} is already in cart of user: ${userId}. Updating with new quantity: ${newQuantity}`,
      );

      return await this._cartsRepository.updateProductInCart(
        userId,
        productToCartDto.productId,
        newQuantity,
      );
    }

    return await this._cartsRepository.addToCart(
      userId,
      productToCartDto.productId,
      productToCartDto.quantity > availableQuantityToAdd
        ? availableQuantityToAdd
        : productToCartDto.quantity,
    );
  }

  @Cacheable({
    cacheKey: (args: any[]) => `user_${args[0]}`,
    ttlSeconds: TimeInSecond.ONE_HOUR,
    hashKey: HashKey.CART,
  })
  public async getUserCart(userId: number): Promise<ICart> {
    const productsInCart = await this._cartsRepository.getProductsInCart(
      userId,
    );
    const total = productsInCart
      .reduce((accumulator: Decimal, product: IProductCart) => {
        return accumulator.plus(new Decimal(product.subtotal));
      }, new Decimal(0))
      .toNumber();

    return { products: productsInCart, total };
  }

  @CacheClear({
    hashKey: HashKey.CART,
    cacheKey: (args: any[]) => `user_${args[0]}`,
  })
  public async deleteProductFromCard(
    productToCartDto: ProductToCartDto,
    userId: number,
  ): Promise<void> {
    const productInCart = await this._cartsRepository.getUserProductInCart(
      productToCartDto.productId,
      userId,
    );
    if (!productInCart) {
      throw new NotFoundException('Product not found');
    }

    const newQuantity = productInCart.quantity - productToCartDto.quantity;
    if (newQuantity < 1) {
      Logger.debug(
        `Removing Product id: ${productInCart.productId} from user: ${userId} such as quantity is negative`,
      );
      await this._cartsRepository.deleteProductFromCart(
        productToCartDto.productId,
        userId,
      );
    } else {
      Logger.debug(
        `Updating Product id: ${productToCartDto.productId} of user: ${userId}. Updating with new quantity: ${newQuantity}`,
      );
      await this._cartsRepository.updateProductInCart(
        userId,
        productToCartDto.productId,
        newQuantity,
      );
    }
  }
}
