import { IProductCart } from '../../products/interfaces/product.interface';

export interface ICart {
  id: number;
  discount?: number;
  products: IProductCart[];
  total: number;
  originalPrice: number;
}
