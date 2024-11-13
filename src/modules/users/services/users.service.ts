import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { FindOptionsWhere } from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import {
  ICredentials,
  IRegistrationCredentials,
} from '../../auth/interfaces/auth.interface';

@Injectable()
export class UsersService {
  constructor(private readonly _usersRepository: UsersRepository) {}

  public async findOne(
    whereConditions: FindOptionsWhere<IUser>,
  ): Promise<IUser> {
    const user = await this._usersRepository.findOne(whereConditions);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  public async getNumberOfUsers(): Promise<number> {
    return await this._usersRepository.getNumberOfUsers();
  }

  public async create(
    registrationCredentials: IRegistrationCredentials,
    isAdmin = false,
  ): Promise<IUser> {
    return await this._usersRepository.create(registrationCredentials, isAdmin);
  }

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
