import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from '../services/carts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserId } from '../../../decorators/user-id.decorator';
import { ICart } from '../interfaces/cart.interface';
import { ProductToCartDto } from '../dtos/product-to-cart.dto';
import { IProductCart } from '../../products/interfaces/product.interface';
import { ApplyDiscountDto } from '../dtos/apply-discount.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartsController {
  constructor(private readonly _cartsService: CartsService) {}

  @Get()
  public async getUserProductsInCart(@UserId() userId: number): Promise<ICart> {
    return await this._cartsService.getUserCart(userId);
  }

  @Post()
  public async addProductToCard(
    @UserId() userId: number,
    @Body() productToCartDto: ProductToCartDto,
  ): Promise<IProductCart> {
    return await this._cartsService.addProductToCart(productToCartDto, userId);
  }

  @Post(':cartId')
  public async applyDiscountToCart(
    @Param('cartId') cartId: number,
    @Body() applyDiscountDto: ApplyDiscountDto,
    @UserId() userId: number,
  ) {
    if (cartId !== applyDiscountDto.cartId) {
      throw new BadRequestException('Invalid cart');
    }
    return await this._cartsService.applyDiscountToCart(
      applyDiscountDto,
      userId,
    );
  }

  @Delete()
  public async deleteProductFromCard(
    @UserId() userId: number,
    @Body() productToCartDto: ProductToCartDto,
  ): Promise<void> {
    return await this._cartsService.deleteProductFromCard(
      productToCartDto,
      userId,
    );
  }
}
