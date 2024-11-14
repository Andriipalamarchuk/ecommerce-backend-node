import { IProduct } from '../interfaces/product.interface';
import { Check, Column, Entity } from 'typeorm';
import { PlatformBaseEntity } from '../../../entities/platform-base.entity';

@Entity({ name: 'Product' })
export class ProductEntity extends PlatformBaseEntity implements IProduct {
  @Column({ name: 'description', type: 'varchar' })
  description: string;

  @Column({ name: 'price', type: 'numeric', precision: 10, scale: 2 })
  @Check('price >= 0')
  price: number;

  @Column({ name: 'available_quantity', type: 'int' })
  @Check('available_quantity >= 0')
  availableQuantity: number;
}
