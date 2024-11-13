import { Module } from '@nestjs/common';
import { EncryptionModule } from '../encryption/encryption.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

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
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AuthModule {}
