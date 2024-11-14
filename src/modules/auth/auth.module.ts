import { Global, Module } from '@nestjs/common';
import { EncryptionModule } from '../encryption/encryption.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { AdminRoleGuard } from './guards/admin.guard';

@Global()
@Module({
  imports: [
    EncryptionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => {
        return {
          secret: configService.get<string>('JWT_TOKEN'),
          signOptions: { expiresIn: '365d' },
        };
      },
      inject: [ConfigService],
    }),
    PassportModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, AdminRoleGuard],
  exports: [AdminRoleGuard],
})
export class AuthModule {}
