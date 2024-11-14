import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { CartEntity } from './cart.entity';

@Entity({ name: 'ProductCart' })
export class ProductCartEntity {
  @PrimaryColumn({ name: 'cart_id', type: 'int' })
  cartId: number;

  //User is optional because can not be joined always
  @ManyToOne(() => CartEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart?: CartEntity;

  @PrimaryColumn({ name: 'product_id', type: 'int' })
  productId: number;

  //User is optional because can not be joined always
  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product?: ProductEntity;

  @Column({ name: 'quantity', type: 'int', default: 1 })
  @Check('quantity > 0')
  quantity: number;
}
