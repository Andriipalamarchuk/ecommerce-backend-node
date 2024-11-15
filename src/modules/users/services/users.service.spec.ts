import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';
import { NotFoundException } from '@nestjs/common';
import { IUser } from '../interfaces/user.interface';
import {
  ICredentials,
  IRegistrationCredentials,
} from '../../auth/interfaces/auth.interface';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Partial<UsersRepository>;

  const mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test',
    surname: 'User',
    isAdmin: false,
  };

  const mockCredentials: ICredentials = {
    email: 'test@example.com',
    password: 'hashedPassword123',
    id: 1,
  };

  beforeEach(() => {
    usersRepository = {};

    usersService = new UsersService(usersRepository as UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneByEmail', () => {
    test('should return a user when found by email', async () => {
      usersRepository.findOneByEmail = jest.fn(async () => mockUser);

      expect(await usersService.findOneByEmail(mockUser.email)).toEqual(
        mockUser,
      );
      expect(usersRepository.findOneByEmail).toHaveBeenCalledWith(
        mockUser.email,
      );
    });

    test('should throw NotFoundException if user is not found by email', async () => {
      usersRepository.findOneByEmail = jest.fn(async () => null);

      await expect(usersService.findOneByEmail(mockUser.email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneById', () => {
    test('should return a user when found by ID', async () => {
      usersRepository.findOneById = jest.fn(async () => mockUser);

      expect(await usersService.findOneById(mockUser.id)).toEqual(mockUser);
      expect(usersRepository.findOneById).toHaveBeenCalledWith(mockUser.id);
    });

    test('should throw NotFoundException if user is not found by ID', async () => {
      usersRepository.findOneById = jest.fn(async () => null);

      await expect(usersService.findOneById(mockUser.id)).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.findOneById).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getNumberOfUsers', () => {
    test('should return the total number of users', async () => {
      usersRepository.getNumberOfUsers = jest.fn(async () => 10);

      expect(await usersService.getNumberOfUsers()).toBe(10);
      expect(usersRepository.getNumberOfUsers).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    test('should create a new user', async () => {
      const registrationCredentials: IRegistrationCredentials = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User',
      };

      usersRepository.create = jest.fn(async () => mockUser);

      expect(await usersService.create(registrationCredentials)).toEqual(
        mockUser,
      );
      expect(usersRepository.create).toHaveBeenCalledWith(
        registrationCredentials,
        false,
      );
    });

    test('should create a new admin user when isAdmin is true', async () => {
      const registrationCredentials: IRegistrationCredentials = {
        email: 'admin@example.com',
        password: 'adminPassword123',
        name: 'Admin',
        surname: 'User',
      };

      usersRepository.create = jest.fn(async () => mockUser);

      expect(await usersService.create(registrationCredentials, true)).toEqual(
        mockUser,
      );
      expect(usersRepository.create).toHaveBeenCalledWith(
        registrationCredentials,
        true,
      );
    });
  });

  describe('getUserCredentialsByEmail', () => {
    test('should return user credentials when found by email', async () => {
      usersRepository.getUserCredentialsByEmail = jest.fn(
        async () => mockCredentials,
      );

      expect(
        await usersService.getUserCredentialsByEmail(mockCredentials.email),
      ).toEqual(mockCredentials);
      expect(usersRepository.getUserCredentialsByEmail).toHaveBeenCalledWith(
        mockCredentials.email,
      );
    });

    test('should throw NotFoundException if credentials are not found by email', async () => {
      usersRepository.getUserCredentialsByEmail = jest.fn(async () => null);

      await expect(
        usersService.getUserCredentialsByEmail(mockCredentials.email),
      ).rejects.toThrow(NotFoundException);

      expect(usersRepository.getUserCredentialsByEmail).toHaveBeenCalledWith(
        mockCredentials.email,
      );
    });
  });
});
