import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity({ name: 'Cart' })
export class CartEntity {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  //User is optional because can not be joined always
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: UserEntity;

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
