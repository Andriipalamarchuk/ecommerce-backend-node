import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { EncryptionService } from '../../encryption/services/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegistrationCredentialsDto } from '../dtos/auth.dto';
import { IUser } from '../../users/interfaces/user.interface';
import { ILoginResult } from '../interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _encryptionService: EncryptionService,
    private readonly _jwtService: JwtService,
  ) {}

  public async register(
    registrationCredentials: RegistrationCredentialsDto,
  ): Promise<IUser> {
    try {
      await this._usersService.findOneByEmail(registrationCredentials.email);
    } catch (e) {
      const numberOfUsers = await this._usersService.getNumberOfUsers();
      const hashedPassword = await this._encryptionService.getHash(
        registrationCredentials.password,
      );
      return await this._usersService.create(
        {
          ...registrationCredentials,
          password: hashedPassword,
        },
        //Used as workaround for first user creation, can be removed if first user will be updated from database
        numberOfUsers === 0,
      );
    }
    throw new ConflictException('User is already existing');
  }

  public async login(loginDto: LoginDto): Promise<ILoginResult> {
    const userCredentials = await this._usersService.getUserCredentialsByEmail(
      loginDto.email,
    );
    if (!userCredentials) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await this._encryptionService.compareHash(
      loginDto.password,
      userCredentials.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const userId = userCredentials.id;

    return { userId, accessToken: this._jwtService.sign({ sub: userId }) };
  }
}
