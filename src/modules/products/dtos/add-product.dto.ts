import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddProductDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  availableQuantity: number;
}
