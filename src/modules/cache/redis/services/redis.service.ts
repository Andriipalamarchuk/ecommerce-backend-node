import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import {
  SCAN_COMMAND_COUNT,
  SCAN_COMMAND_COUNT_LIMIT,
  SCAN_COMMAND_MATCH,
} from '../constants/redis.constants';

@Injectable()
export class RedisService {
  private redisInstance: Redis;

  constructor(@Inject('RedisConnection') redisInstance: Redis) {
    this.redisInstance = redisInstance;
  }

  /**
   * Delete a key asynchronously in another thread. Otherwise it is just as DEL, but non blocking.
   * The boolean isPattern is needed in case of wildcard use
   * - _group_: generic
   * - _complexity_: O(1) for each key removed regardless of its size. Then the command does O(N) work in a different thread in order to reclaim memory, where N is the number of allocations the deleted objects where composed of.
   */
  public async unlinkKey(key: string, isPattern = false): Promise<number> {
    if (!this.isConnected()) {
      return 0;
    }
    // Delete keys that match a string pattern
    if (isPattern) {
      const keys = await this.scanKeys(key);
      if (!keys.length) return 0;
      return this.redisInstance.unlink(keys);
    }

    return this.redisInstance.unlink(key);
  }

  /**
   * Set the string value of a key
   * - _group_: string
   * - _complexity_: O(1)
   */
  public async setKey(
    key: string,
    value: string | number | Buffer,
  ): Promise<string> {
    if (!this.isConnected()) {
      return '';
    }
    return this.redisInstance.set(key, value);
  }

  /**
   * Incrementally iterate the keys space
   * Default count of the cursor is 1k
   * - _group_: generic
   * - _complexity_: O(1) for every call. O(N) for a complete iteration, including enough command calls for the cursor to return back to 0. N is the number of elements inside the collection.
   */
  public async scanKeys(
    pattern: string,
    limit = SCAN_COMMAND_COUNT_LIMIT,
  ): Promise<string[]> {
    if (!this.isConnected()) {
      return [];
    }

    let cursor = 0;
    let keys: string[] = [];
    do {
      const result = (await this.redisInstance.scan(
        cursor,
        SCAN_COMMAND_MATCH,
        pattern,
        SCAN_COMMAND_COUNT,
        limit,
      )) as [string, string[]] | undefined;

      if (result) {
        keys = [...keys, ...result[1]];
        cursor = Number(result[0]) !== 0 ? Number(result[0]) : 0;
      } else {
        cursor = 0;
      }
    } while (cursor !== 0);

    return keys;
  }

  public isConnected(): boolean {
    Logger.verbose(`Redis instance status ${this.redisInstance.status}`);
    // RedisStatus at the moment is not exposed
    return this.redisInstance.status === 'ready';
  }
}
