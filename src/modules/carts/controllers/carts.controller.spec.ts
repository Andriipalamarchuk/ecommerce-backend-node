import { CartsController } from './carts.controller';
import { CartsService } from '../services/carts.service';
import { BadRequestException } from '@nestjs/common';
import { ProductToCartDto } from '../dtos/product-to-cart.dto';
import { ApplyDiscountDto } from '../dtos/apply-discount.dto';
import { ICart } from '../interfaces/cart.interface';
import { IProductCart } from '../../products/interfaces/product.interface';
import { IDiscount } from '../../discounts/interfaces/discount.interface';
import { DiscountEnum } from '../../discounts/enums/discount.enum';

describe('CartsController', () => {
  let cartsController: CartsController;
  let cartsService: Partial<CartsService>;

  beforeEach(async () => {
    cartsService = {};
    cartsController = new CartsController(cartsService as CartsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getUserProductsInCart', async () => {
    const userId = 1;
    const mockCart: ICart = {
      products: [],
      id: 1,
      originalPrice: 0.0,
      total: 0.0,
    };
    cartsService.getUserCart = jest.fn(async () => mockCart);

    expect(await cartsController.getUserProductsInCart(userId)).toEqual(
      mockCart,
    );
    expect(cartsService.getUserCart).toHaveBeenCalledWith(userId);
  });

  test('addProductToCard', async () => {
    const userId = 1;
    const productToCartDto: ProductToCartDto = { productId: 1, quantity: 2 };
    const mockProduct: IProductCart = {
      id: 1,
      subtotal: 10.0,
      price: 5.0,
      quantity: 2,
    };

    cartsService.addProductToCart = jest.fn(async () => mockProduct);

    expect(
      await cartsController.addProductToCard(userId, productToCartDto),
    ).toEqual(mockProduct);
    expect(cartsService.addProductToCart).toHaveBeenCalledWith(
      productToCartDto,
      userId,
    );
  });

  describe('applyDiscountToCart', () => {
    test('apply a discount to the cart', async () => {
      const userId = 1;
      const cartId = 1;
      const applyDiscountDto: ApplyDiscountDto = {
        cartId: 1,
        code: 'SAVE10',
      };
      const mockResult: IDiscount = {
        id: 1,
        code: 'SAVE10',
        value: 10,
        type: DiscountEnum.PERCENTAGE,
        validTo: new Date(),
        validFrom: new Date(),
      };
      cartsService.applyDiscountToCart = jest.fn(async () => mockResult);

      expect(
        await cartsController.applyDiscountToCart(
          cartId,
          applyDiscountDto,
          userId,
        ),
      ).toEqual(mockResult);
      expect(cartsService.applyDiscountToCart).toHaveBeenCalledWith(
        applyDiscountDto,
        userId,
      );
    });

    test('cartId does not match', async () => {
      const userId = 1;
      const cartId = 1;
      cartsService.applyDiscountToCart = jest.fn();

      const applyDiscountDto: ApplyDiscountDto = {
        cartId: 2,
        code: 'SAVE10',
      };

      await expect(
        cartsController.applyDiscountToCart(cartId, applyDiscountDto, userId),
      ).rejects.toThrow(BadRequestException);

      expect(cartsService.applyDiscountToCart).not.toHaveBeenCalled();
    });
  });

  test('deleteProductFromCard', async () => {
    const userId = 1;
    const productToCartDto: ProductToCartDto = { productId: 1, quantity: 1 };

    cartsService.deleteProductFromCard = jest.fn();

    await cartsController.deleteProductFromCard(userId, productToCartDto);

    expect(cartsService.deleteProductFromCard).toHaveBeenCalledWith(
      productToCartDto,
      userId,
    );
  });
});
