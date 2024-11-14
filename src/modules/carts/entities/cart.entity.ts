import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ProductCartEntity } from './product-cart.entity';
import { DiscountEntity } from '../../discounts/entities/discount.entity';

@Entity({ name: 'Cart' })
export class CartEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  //User is optional because can not be joined always
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: UserEntity;

  @OneToMany(() => ProductCartEntity, (product) => product.cart)
  productCart: ProductCartEntity[];

  @Column({ name: 'discount_id', type: 'int', nullable: true })
  discountId: number | null;

  @ManyToOne(() => DiscountEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'discount_id', referencedColumnName: 'id' })
  discount?: DiscountEntity;
}
