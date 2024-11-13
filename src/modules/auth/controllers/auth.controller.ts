import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto, RegistrationCredentialsDto } from '../dtos/auth.dto';
import { IUser } from '../../users/interfaces/user.interface';
import { AuthService } from '../services/auth.service';
import { ILoginResult } from '../interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  //TODO: Should be better implement also session tokens
  constructor(private readonly _authService: AuthService) {}
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() registrationCredentials: RegistrationCredentialsDto,
  ): Promise<IUser> {
    return await this._authService.register(registrationCredentials);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() loginDto: LoginDto): Promise<ILoginResult> {
    return await this._authService.login(loginDto);
  }
}
