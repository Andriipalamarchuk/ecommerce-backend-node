import { Injectable } from '@nestjs/common';
import { DiscountEntity } from '../entities/discount.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { IDiscount } from '../interfaces/discount.interface';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DiscountsRepository {
  constructor(
    @InjectRepository(DiscountEntity)
    private readonly _discountRepo: Repository<DiscountEntity>,
  ) {}

  public async createDiscount(
    createDiscountDto: CreateDiscountDto,
  ): Promise<IDiscount> {
    return await this._discountRepo.save(createDiscountDto);
  }

  public async deleteDiscount(id: number): Promise<void> {
    await this._discountRepo.delete({ id });
  }

  public async getDiscount(code: string): Promise<IDiscount | null> {
    const today = new Date();
    return await this._discountRepo.findOne({
      where: {
        code,
        validFrom: LessThanOrEqual(today),
        validTo: MoreThanOrEqual(today),
      },
    });
  }

  public async getDiscountById(id: number): Promise<IDiscount | null> {
    return await this._discountRepo.findOne({ where: { id } });
  }

  public async getAllDiscounts(): Promise<IDiscount[]> {
    return await this._discountRepo.find();
  }
}
