import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly _usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('User should be logged in');
    }
    const user = await this._usersService.findOneById(userId);
    return user.isAdmin;
  }
}
