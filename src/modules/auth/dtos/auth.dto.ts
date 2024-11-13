import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ILogin, IRegistrationCredentials } from '../interfaces/auth.interface';

export class LoginDto implements ILogin {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  password: string;
}

export class RegistrationCredentialsDto implements IRegistrationCredentials {
  @IsEmail()
  @MaxLength(100)
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MaxLength(100)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    { message: 'Password not strong enough' },
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  surname: string;
}
