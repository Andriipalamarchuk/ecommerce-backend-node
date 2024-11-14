import { DiscountEnum } from '../enums/discount.enum';

export interface IDiscount {
  id: number;
  code: string;
  value: number;
  type: DiscountEnum;
  validFrom: Date;
  validTo: Date;
}
