import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CartsService } from '../services/carts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserId } from '../../../decorators/user-id.decorator';
import { ICart } from '../interfaces/cart.interface';
import { ProductToCartDto } from '../dtos/product-to-cart.dto';
import { IProductCart } from '../../products/interfaces/product.interface';

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
