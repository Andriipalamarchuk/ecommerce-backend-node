import { IsNumber, IsOptional } from 'class-validator';

export class ProductToCartDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}
