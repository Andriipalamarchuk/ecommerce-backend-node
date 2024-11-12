import { ModuleMetadata } from '@nestjs/common';

export interface RedisConnectOptions {
  /**
   * server name or IP address
   */
  host: string;
  /**
   * server port number
   */
  port: number;
  /**
   * password used to connect
   */
  password?: string;
  /**
   * used to delete all the keys after a connection
   */
  patternToClean?: string;
}

export interface RedisConnectOptionsAsync
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisConnectOptions> | RedisConnectOptions;
  inject?: any[];
}
