import { IPlatformBase } from '../../../interfaces/platform-base.interface';

export interface IProduct extends IPlatformBase {
  description: string;
  price: number;
  availableQuantity: number;
}

export interface IProductCart extends Pick<IProduct, 'id' | 'price'> {
  quantity: number;
  subtotal: number;
}
