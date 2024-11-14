import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CartsRepository } from '../repositories/carts.repository';
import { ICart } from '../interfaces/cart.interface';
import { ProductsService } from '../../products/services/products.service';
import { ProductToCartDto } from '../dtos/product-to-cart.dto';
import { Cacheable, CacheClear } from '@type-cacheable/core';
import { TimeInSecond } from '../../../enums/time-in-seconds.enum';
import { HashKey } from '../../../enums/hash-key.enum';
import { IProductCart } from '../../products/interfaces/product.interface';
import { ApplyDiscountDto } from '../dtos/apply-discount.dto';
import { DiscountsService } from '../../discounts/services/discounts.service';
import { IDiscount } from '../../discounts/interfaces/discount.interface';

@Injectable()
export class CartsService {
  constructor(
    private readonly _cartsRepository: CartsRepository,
    private readonly _productsService: ProductsService,
    private readonly _discountsService: DiscountsService,
  ) {}

  @CacheClear({
    hashKey: HashKey.CART,
    cacheKey: (args: any[]) => `user_${args[1]}`,
  })
  public async addProductToCart(
    productToCartDto: ProductToCartDto,
    userId: number,
  ): Promise<IProductCart> {
    let cart = await this._cartsRepository.getUserCart(userId);
    if (!cart) {
      cart = await this._cartsRepository.createCart(userId);
    }
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
      //In case if quantity is not present, we just increase by 1
      const requestedQuantityAdd = productToCartDto.quantity || 1;
      const newQuantity =
        requestedQuantityAdd + isProductAlreadyInUserCart.quantity >
        availableQuantityToAdd
          ? availableQuantityToAdd
          : requestedQuantityAdd + isProductAlreadyInUserCart.quantity;

      Logger.debug(
        `Product id: ${product.id} is already in cart of user: ${userId}. Updating with new quantity: ${newQuantity}`,
      );

      return await this._cartsRepository.updateProductInCart(
        cart.id,
        productToCartDto.productId,
        newQuantity,
      );
    }

    return await this._cartsRepository.addToCart(
      cart.id,
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
    const cart = await this._cartsRepository.getUserCart(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  @CacheClear({
    hashKey: HashKey.CART,
    cacheKey: (args: any[]) => `user_${args[1]}`,
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

    const newQuantity =
      productInCart.quantity - (productToCartDto.quantity || 0);

    if (newQuantity < 1 || !productToCartDto.quantity) {
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

  @CacheClear({
    hashKey: HashKey.CART,
    cacheKey: (args: any[]) => `user_${args[1]}`,
  })
  public async applyDiscountToCart(
    applyDiscountDto: ApplyDiscountDto,
    userId: number,
  ): Promise<IDiscount> {
    const [cart, discount] = await Promise.all([
      this.getUserCart(userId),
      this._discountsService.getDiscount(applyDiscountDto.code),
    ]);
    if (cart.id !== applyDiscountDto.cartId) {
      throw new ForbiddenException(`Cart is not accessible for this user`);
    }

    await this._cartsRepository.applyDiscountToCart(cart.id, discount.id);

    return discount;
  }
}
