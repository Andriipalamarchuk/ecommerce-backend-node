import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import { RegistrationCredentialsDto } from '../../auth/dtos/auth.dto';
import { ICredentials } from '../../auth/interfaces/auth.interface';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _repository: Repository<UserEntity>,
  ) {}

  public static userEntityToUser(userEntity?: UserEntity): IUser | null {
    if (!userEntity) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...restOfEntity } = userEntity;

    return restOfEntity;
  }

  public async findOneByEmail(email: string): Promise<IUser | null> {
    const findResult = await this._repository.findOne({ where: { email } });
    return UsersRepository.userEntityToUser(findResult);
  }

  public async create(
    registrationCredentials: RegistrationCredentialsDto,
    isAdmin: boolean,
  ): Promise<IUser> {
    const saveResult = await this._repository.save({
      ...registrationCredentials,
      isAdmin,
    });

    return UsersRepository.userEntityToUser(saveResult);
  }

  public async getUserCredentialsByEmail(
    email: string,
  ): Promise<ICredentials | null> {
    return await this._repository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });
  }

  public async getNumberOfUsers(): Promise<number> {
    return await this._repository.count();
  }

  public async findOneById(id: number): Promise<IUser> {
    const findResult = await this._repository.findOne({ where: { id } });
    return UsersRepository.userEntityToUser(findResult);
  }
}
