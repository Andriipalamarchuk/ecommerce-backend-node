import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DiscountsService } from '../services/discounts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { IDiscount } from '../interfaces/discount.interface';
import { AdminRoleGuard } from '../../auth/guards/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly _discountsService: DiscountsService) {}

  @UseGuards(AdminRoleGuard)
  @Get()
  public async getAllDiscounts(): Promise<IDiscount[]> {
    return await this._discountsService.getAllDiscounts();
  }

  @Get(':code')
  public async getDiscount(@Param('code') code: string): Promise<IDiscount> {
    return await this._discountsService.getDiscount(code);
  }

  @UseGuards(AdminRoleGuard)
  @Post()
  public async createDiscount(
    @Body() createDiscountDto: CreateDiscountDto,
  ): Promise<IDiscount> {
    return await this._discountsService.createDiscount(createDiscountDto);
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':id')
  public async deleteDiscount(@Param('id') id: number): Promise<void> {
    await this._discountsService.deleteDiscount(id);
  }
}
