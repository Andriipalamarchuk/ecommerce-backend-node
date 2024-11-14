import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisConnectOptionsAsync } from './interfaces/redis-connect-options';
import { getRedisAsyncConnectionProvider } from './providers/redis.connection';
import { RedisService } from './services/redis.service';

@Global()
@Module({})
export class RedisModule {
  public static forRootAsync(options: RedisConnectOptionsAsync): DynamicModule {
    const providers = [getRedisAsyncConnectionProvider(options), RedisService];

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers,
      exports: providers,
    };
  }
}
