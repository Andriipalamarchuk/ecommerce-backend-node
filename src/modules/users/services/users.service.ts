import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { IUser } from '../interfaces/user.interface';
import {
  ICredentials,
  IRegistrationCredentials,
} from '../../auth/interfaces/auth.interface';
import { Cacheable, CacheClear } from '@type-cacheable/core';
import { HashKey } from '../../../enums/hash-key.enum';
import { TimeInSecond } from '../../../enums/time-in-seconds.enum';

@Injectable()
export class UsersService {
  constructor(private readonly _usersRepository: UsersRepository) {}

  @Cacheable({
    hashKey: HashKey.USER_EMAIL,
    cacheKey: (args: any[]) => `user_${args[0]}`,
    ttlSeconds: TimeInSecond.ONE_DAY,
  })
  public async findOneByEmail(email: string): Promise<IUser> {
    const user = await this._usersRepository.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Cacheable({
    hashKey: HashKey.USER_ID,
    cacheKey: (args: any[]) => `user_${args[0]}`,
    ttlSeconds: TimeInSecond.ONE_DAY,
  })
  public async findOneById(id: number): Promise<IUser> {
    const user = await this._usersRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Cacheable({
    hashKey: HashKey.NUMBER_OF_USERS,
    ttlSeconds: TimeInSecond.ONE_DAY,
  })
  public async getNumberOfUsers(): Promise<number> {
    return await this._usersRepository.getNumberOfUsers();
  }

  @CacheClear({
    hashKey: HashKey.NUMBER_OF_USERS,
  })
  public async create(
    registrationCredentials: IRegistrationCredentials,
    isAdmin = false,
  ): Promise<IUser> {
    return await this._usersRepository.create(registrationCredentials, isAdmin);
  }

  @Cacheable({
    hashKey: HashKey.USER_CREDENTIALS,
    cacheKey: (args: any[]) => `user_${args[0]}`,
    ttlSeconds: TimeInSecond.ONE_DAY,
  })
  public async getUserCredentialsByEmail(email: string): Promise<ICredentials> {
    const credentials = await this._usersRepository.getUserCredentialsByEmail(
      email,
    );
    if (!credentials) {
      throw new NotFoundException('User not found');
    }

    return credentials;
  }
}
