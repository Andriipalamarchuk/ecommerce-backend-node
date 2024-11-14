import { Column, Entity, Index } from 'typeorm';
import { PlatformBaseEntity } from '../../../entities/platform-base.entity';
import { IDiscount } from '../interfaces/discount.interface';
import { DiscountEnum } from '../enums/discount.enum';
import { DateTransformer } from '../transformers/date.transformer';

@Entity({ name: 'Discount' })
export class DiscountEntity extends PlatformBaseEntity implements IDiscount {
  @Index('IDX_Discount_Code')
  @Column({ name: 'code', type: 'varchar', unique: true })
  code: string;

  @Column({ name: 'value', type: 'int' })
  value: number;

  @Column({ name: 'type', type: 'enum', enum: DiscountEnum })
  type: DiscountEnum;

  @Column({
    name: 'valid_from',
    type: 'timestamp',
    transformer: new DateTransformer(),
  })
  validFrom: Date;

  @Column({
    name: 'valid_to',
    type: 'timestamp',
    transformer: new DateTransformer(),
  })
  validTo: Date;
}
