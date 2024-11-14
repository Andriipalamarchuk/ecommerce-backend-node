import { Module } from '@nestjs/common';
import { CartsController } from './controllers/carts.controller';
import { CartsService } from './services/carts.service';
import { CartsRepository } from './repositories/carts.repository';
import { ProductsModule } from '../products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { ProductCartEntity } from './entities/product-cart.entity';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, ProductCartEntity]),
    ProductsModule,
    DiscountsModule,
  ],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
})
export class CartsModule {}
