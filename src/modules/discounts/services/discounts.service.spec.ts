import { DiscountsService } from './discounts.service';
import { DiscountsRepository } from '../repositories/discounts.repository';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { IDiscount } from '../interfaces/discount.interface';
import { DiscountEnum } from '../enums/discount.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RedisService } from '../../cache/redis/services/redis.service';

describe('DiscountsService', () => {
  let discountsService: DiscountsService;
  let discountsRepository: Partial<DiscountsRepository>;
  let redisService: Partial<RedisService>;

  const mockDiscount: IDiscount = {
    id: 1,
    code: 'SAVE10',
    value: 10,
    validFrom: new Date(),
    validTo: new Date(),
    type: DiscountEnum.PERCENTAGE,
  };

  const createDiscountDto: CreateDiscountDto = {
    code: 'SAVE10',
    value: 10,
    validFrom: new Date(),
    validTo: new Date(),
    type: DiscountEnum.PERCENTAGE,
  };

  beforeEach(() => {
    discountsRepository = {};
    redisService = {};
    discountsService = new DiscountsService(
      discountsRepository as DiscountsRepository,
      redisService as RedisService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDiscount', () => {
    test('should create a discount if code does not exist', async () => {
      discountsRepository.getDiscount = jest.fn(null);
      discountsRepository.createDiscount = jest.fn(async () => mockDiscount);

      expect(await discountsService.createDiscount(createDiscountDto)).toEqual(
        mockDiscount,
      );
      expect(discountsRepository.getDiscount).toHaveBeenCalledWith(
        createDiscountDto.code,
      );
      expect(discountsRepository.createDiscount).toHaveBeenCalledWith(
        createDiscountDto,
      );
    });

    test('should throw ConflictException if discount code exists', async () => {
      discountsRepository.getDiscount = jest.fn(async () => mockDiscount);
      discountsRepository.createDiscount = jest.fn();

      await expect(
        discountsService.createDiscount(createDiscountDto),
      ).rejects.toThrow(ConflictException);

      expect(discountsRepository.createDiscount).not.toHaveBeenCalled();
    });
  });

  describe('deleteDiscount', () => {
    test('should delete discount and unlink Redis key', async () => {
      discountsRepository.getDiscountById = jest.fn(async () => mockDiscount);
      redisService.unlinkKey = jest.fn();
      discountsRepository.deleteDiscount = jest.fn();

      await discountsService.deleteDiscount(mockDiscount.id);

      expect(discountsRepository.getDiscountById).toHaveBeenCalledWith(
        mockDiscount.id,
      );
      expect(discountsRepository.deleteDiscount).toHaveBeenCalledWith(
        mockDiscount.id,
      );
      expect(redisService.unlinkKey).toHaveBeenCalledWith(
        mockDiscount.code,
        true,
      );
    });

    test('should throw NotFoundException if discount does not exist', async () => {
      discountsRepository.getDiscountById = jest.fn(async () => null);
      discountsRepository.deleteDiscount = jest.fn();

      await expect(
        discountsService.deleteDiscount(mockDiscount.id),
      ).rejects.toThrow(NotFoundException);

      expect(discountsRepository.getDiscountById).toHaveBeenCalledWith(
        mockDiscount.id,
      );
      expect(discountsRepository.deleteDiscount).not.toHaveBeenCalled();
    });
  });

  describe('getDiscount', () => {
    test('should return the discount by code', async () => {
      discountsRepository.getDiscount = jest.fn(async () => mockDiscount);

      expect(await discountsService.getDiscount(mockDiscount.code)).toEqual(
        mockDiscount,
      );
      expect(discountsRepository.getDiscount).toHaveBeenCalledWith(
        mockDiscount.code,
      );
    });

    test('should throw NotFoundException if discount not found', async () => {
      discountsRepository.getDiscount = jest.fn(async () => null);

      await expect(
        discountsService.getDiscount(mockDiscount.code),
      ).rejects.toThrow(NotFoundException);

      expect(discountsRepository.getDiscount).toHaveBeenCalledWith(
        mockDiscount.code,
      );
    });
  });

  describe('getAllDiscounts', () => {
    test('should return all discounts', async () => {
      discountsRepository.getAllDiscounts = jest.fn(async () => [mockDiscount]);

      expect(await discountsService.getAllDiscounts()).toEqual([mockDiscount]);
      expect(discountsRepository.getAllDiscounts).toHaveBeenCalled();
    });
  });
});
