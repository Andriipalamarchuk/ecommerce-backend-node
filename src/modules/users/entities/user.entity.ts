import { Column, Entity } from 'typeorm';
import { PlatformBaseEntity } from '../../../entities/platform-base.entity';
import { IUser } from '../interfaces/user.interface';

@Entity({ name: 'User' })
export class UserEntity extends PlatformBaseEntity implements IUser {
  //TODO: Implement also hashing of email in the way to respect privacy policy and use only id
  @Column({ name: 'email', type: 'varchar', unique: true })
  email: string;
  @Column({ name: 'password', type: 'varchar' })
  password: string;
  @Column({ name: 'name', type: 'varchar' })
  name: string;
  @Column({ name: 'surname', type: 'varchar' })
  surname: string;
  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;
}
