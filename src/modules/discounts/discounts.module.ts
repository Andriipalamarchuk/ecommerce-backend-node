import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountsController } from './controllers/discounts.controller';
import { DiscountsService } from './services/discounts.service';
import { DiscountsRepository } from './repositories/discounts.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountEntity]), UsersModule],
  controllers: [DiscountsController],
  providers: [DiscountsRepository, DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
