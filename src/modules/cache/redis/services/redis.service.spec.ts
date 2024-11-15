import Redis from 'ioredis';
import { RedisService } from './redis.service';
import {
  SCAN_COMMAND_COUNT,
  SCAN_COMMAND_COUNT_LIMIT,
  SCAN_COMMAND_MATCH,
} from '../constants/redis.constants';

describe('RedisService', () => {
  let redisService: RedisService;
  let redisInstance: Partial<Redis>;

  beforeEach(() => {
    redisInstance = {};
    redisService = new RedisService(redisInstance as Redis);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('unlinkKey', () => {
    test('no pattern', async () => {
      redisInstance.unlink = jest.fn(async () => 1);
      redisService.isConnected = jest.fn(() => true);
      expect(await redisService.unlinkKey('test')).toEqual(1);
      expect(redisInstance.unlink).toHaveBeenCalledWith('test');
    });

    test('with pattern', async () => {
      redisInstance.unlink = jest.fn(async () => 1);
      redisService.isConnected = jest.fn(() => true);
      redisService['scanKeys'] = jest.fn(async () => ['key']);
      expect(await redisService.unlinkKey('test_*', true)).toEqual(1);
      expect(redisInstance.unlink).toHaveBeenCalledWith(['key']);
    });

    test('with pattern no data', async () => {
      redisInstance.unlink = jest.fn(async () => 1);
      redisService.isConnected = jest.fn(() => true);
      redisService['scanKeys'] = jest.fn(async () => []);
      expect(await redisService.unlinkKey('test_*', true)).toEqual(0);
    });
  });

  test('set key', async () => {
    redisInstance.set = jest.fn().mockReturnValueOnce('OK');
    redisService.isConnected = jest.fn(() => true);
    expect(await redisService.setKey('test', 'value')).toEqual('OK');
    expect(redisInstance.set).toHaveBeenCalledWith('test', 'value');
  });

  test('scanKeys', async () => {
    redisInstance.scan = jest
      .fn()
      .mockReturnValueOnce(['user_*', ['user_1', 'user_2']]);
    redisService.isConnected = jest.fn(() => true);
    expect(await redisService.scanKeys('user_*')).toEqual(['user_1', 'user_2']);
    expect(redisInstance.scan).toHaveBeenCalledWith(
      0,
      SCAN_COMMAND_MATCH,
      'user_*',
      SCAN_COMMAND_COUNT,
      SCAN_COMMAND_COUNT_LIMIT,
    );
  });

  describe('isConnected', () => {
    test('connected', async () => {
      redisInstance.status = 'ready';
      expect(redisService.isConnected()).toEqual(true);
    });

    test('not connected', async () => {
      redisInstance.status = 'connecting';
      expect(redisService.isConnected()).toEqual(false);
    });
  });
});
