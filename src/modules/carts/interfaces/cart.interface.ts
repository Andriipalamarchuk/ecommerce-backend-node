import { IProductCart } from '../../products/interfaces/product.interface';

export interface ICart {
  products: IProductCart[];
  total: number;
}
