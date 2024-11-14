import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IDiscount } from '../interfaces/discount.interface';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { DiscountsRepository } from '../repositories/discounts.repository';
import { Cacheable, CacheClear } from '@type-cacheable/core';
import { TimeInSecond } from '../../../enums/time-in-seconds.enum';
import { HashKey } from '../../../enums/hash-key.enum';
import { RedisService } from '../../cache/redis/services/redis.service';

@Injectable()
export class DiscountsService {
  constructor(
    private readonly _discountsRepository: DiscountsRepository,
    private readonly _redisService: RedisService,
  ) {}

  @CacheClear({
    hashKey: HashKey.DISCOUNTS,
  })
  public async createDiscount(
    createDiscountDto: CreateDiscountDto,
  ): Promise<IDiscount> {
    try {
      await this.getDiscount(createDiscountDto.code);
    } catch {
      return await this._discountsRepository.createDiscount(createDiscountDto);
    }
    throw new ConflictException('Discount with this code already existing');
  }

  @CacheClear({
    hashKey: HashKey.DISCOUNTS,
  })
  public async deleteDiscount(id: number): Promise<void> {
    const discount = await this.getDiscountById(id);

    await Promise.all([
      this._discountsRepository.deleteDiscount(id),
      this._redisService.unlinkKey(discount.code, true),
    ]);
  }

  @Cacheable({
    cacheKey: (args: any[]) => `discount_${args[0]}`,
    ttlSeconds: TimeInSecond.ONE_DAY,
    hashKey: HashKey.DISCOUNTS,
  })
  public async getDiscount(code: string): Promise<IDiscount> {
    const discount = await this._discountsRepository.getDiscount(code);
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  @Cacheable({
    ttlSeconds: TimeInSecond.ONE_DAY,
    hashKey: HashKey.DISCOUNTS,
  })
  public async getAllDiscounts(): Promise<IDiscount[]> {
    return await this._discountsRepository.getAllDiscounts();
  }

  private async getDiscountById(id: number): Promise<IDiscount> {
    const discount = await this._discountsRepository.getDiscountById(id);
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }
}
