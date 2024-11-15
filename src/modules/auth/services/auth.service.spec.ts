import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { EncryptionService } from '../../encryption/services/encryption.service';
import { IUser } from '../../users/interfaces/user.interface';
import { LoginDto, RegistrationCredentialsDto } from '../dtos/auth.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let encryptionService: Partial<EncryptionService>;
  let jwtService: Partial<JwtService>;

  const mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test',
    surname: 'User',
    isAdmin: false,
  };

  const registrationCredentials: RegistrationCredentialsDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test',
    surname: 'User',
  };

  const loginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(() => {
    usersService = {};

    encryptionService = {};

    jwtService = {};

    authService = new AuthService(
      usersService as UsersService,
      encryptionService as EncryptionService,
      jwtService as JwtService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should create a new user if email does not exist', async () => {
      usersService.findOneByEmail = jest.fn(async () => {
        throw new NotFoundException('User not found');
      });
      usersService.getNumberOfUsers = jest.fn(async () => 0);
      encryptionService.getHash = jest.fn(async () => 'hashedPassword123');
      usersService.create = jest.fn(async () => mockUser);

      expect(await authService.register(registrationCredentials)).toEqual(
        mockUser,
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        registrationCredentials.email,
      );
      expect(usersService.getNumberOfUsers).toHaveBeenCalled();
      expect(encryptionService.getHash).toHaveBeenCalledWith(
        registrationCredentials.password,
      );
      expect(usersService.create).toHaveBeenCalledWith(
        {
          ...registrationCredentials,
          password: 'hashedPassword123',
        },
        true,
      );
    });

    test('should throw ConflictException if email already exists', async () => {
      usersService.findOneByEmail = jest.fn(async () => mockUser);
      usersService.create = jest.fn();

      await expect(
        authService.register(registrationCredentials),
      ).rejects.toThrow(ConflictException);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        registrationCredentials.email,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('should return a valid login result for correct credentials', async () => {
      usersService.getUserCredentialsByEmail = jest.fn(async () => ({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
      }));
      encryptionService.compareHash = jest.fn(async () => true);
      jwtService.sign = jest.fn(() => 'jwtToken');

      expect(await authService.login(loginDto)).toEqual({
        userId: 1,
        accessToken: 'jwtToken',
      });
      expect(usersService.getUserCredentialsByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(encryptionService.compareHash).toHaveBeenCalledWith(
        loginDto.password,
        'hashedPassword123',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1 });
    });

    test('should throw UnauthorizedException for invalid email', async () => {
      usersService.getUserCredentialsByEmail = jest.fn(async () => null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.getUserCredentialsByEmail).toHaveBeenCalledWith(
        loginDto.email,
      );
    });

    test('should throw UnauthorizedException for invalid password', async () => {
      usersService.getUserCredentialsByEmail = jest.fn(async () => ({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
      }));
      encryptionService.compareHash = jest.fn(async () => false);
      jwtService.sign = jest.fn();

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(encryptionService.compareHash).toHaveBeenCalledWith(
        loginDto.password,
        'hashedPassword123',
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
