import { Module } from '@nestjs/common';
import { validationSchema } from './config/config-validation.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './modules/cache/redis/redis.module';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { CartsModule } from './modules/carts/carts.module';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { HashKey } from './enums/hash-key.enum';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService) => {
        return {
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT'), 10),
          password: configService.get('REDIS_PASSWORD'),
          patternToClean: HashKey.PATTERN_CLEAN_ALL,
        };
      },
    }),
    AppModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    CartsModule,
    ProductsModule,
  ],
})
export class AppModule {}
