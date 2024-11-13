import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
