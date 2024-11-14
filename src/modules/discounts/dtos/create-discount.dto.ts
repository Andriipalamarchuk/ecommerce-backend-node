import { DiscountEnum } from '../enums/discount.enum';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  value: number;

  @IsEnum(DiscountEnum)
  type: DiscountEnum;

  @IsDate()
  validFrom: Date;

  @IsDate()
  validTo: Date;
}
