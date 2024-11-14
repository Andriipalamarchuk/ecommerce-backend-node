import { IsNumber } from 'class-validator';

export class ProductToCartDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;
}
