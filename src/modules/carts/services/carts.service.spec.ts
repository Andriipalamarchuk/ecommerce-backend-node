import { CartsService } from './carts.service';
import { CartsRepository } from '../repositories/carts.repository';
import { ProductsService } from '../../products/services/products.service';
import { DiscountsService } from '../../discounts/services/discounts.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProductToCartDto } from '../dtos/product-to-cart.dto';
import { ApplyDiscountDto } from '../dtos/apply-discount.dto';
import { ICart } from '../interfaces/cart.interface';
import {
  IProduct,
  IProductCart,
} from '../../products/interfaces/product.interface';
import { IDiscount } from '../../discounts/interfaces/discount.interface';
import { DiscountEnum } from '../../discounts/enums/discount.enum';

describe('CartsService', () => {
  let cartsService: CartsService;
  let cartsRepository: Partial<CartsRepository>;
  let productsService: Partial<ProductsService>;
  let discountsService: Partial<DiscountsService>;

  const userId = 1;
  const productToCartDto: ProductToCartDto = { productId: 1, quantity: 2 };
  const mockProduct: IProduct = {
    id: 1,
    availableQuantity: 5,
    price: 10,
    description: 'Product description',
    createdAt: new Date(),
  };
  const mockCart: ICart = { id: 1, total: 0, originalPrice: 0, products: [] };
  const mockCartProduct: IProductCart = {
    id: 1,
    price: 10.0,
    subtotal: 10.0,
    quantity: 1,
  };
  const applyDiscountDto: ApplyDiscountDto = { cartId: 1, code: 'SAVE10' };
  const mockDiscount: IDiscount = {
    id: 1,
    code: 'SAVE10',
    value: 10,
    validFrom: new Date(),
    validTo: new Date(),
    type: DiscountEnum.PERCENTAGE,
  };

  beforeEach(async () => {
    cartsRepository = {};
    productsService = {};
    discountsService = {};

    cartsService = new CartsService(
      cartsRepository as CartsRepository,
      productsService as ProductsService,
      discountsService as DiscountsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addProductToCart', () => {
    test('should create a cart if user does not have one', async () => {
      cartsRepository.getUserCart = jest.fn(async () => null);
      cartsRepository.createCart = jest.fn(async () => mockCart);
      productsService.getProduct = jest.fn(async () => mockProduct);
      cartsRepository.getProductInCartQuantity = jest.fn(async () => 1);
      cartsRepository.getUserProductInCart = jest.fn(async () => null);
      cartsRepository.addToCart = jest.fn(async () => mockCartProduct);

      expect(
        await cartsService.addProductToCart(productToCartDto, userId),
      ).toEqual(mockCartProduct);
      expect(cartsRepository.getUserCart).toHaveBeenCalledWith(userId);
      expect(cartsRepository.createCart).toHaveBeenCalledWith(userId);
      expect(productsService.getProduct).toHaveBeenCalledWith(
        productToCartDto.productId,
      );
      expect(cartsRepository.getUserProductInCart).toHaveBeenCalledWith(
        productToCartDto.productId,
        userId,
      );
      expect(cartsRepository.getProductInCartQuantity).toHaveBeenCalled();
      expect(cartsRepository.addToCart).toHaveBeenCalledWith(
        mockCart.id,
        productToCartDto.productId,
        productToCartDto.quantity,
      );
    });

    test('should throw ConflictException if product is not available', async () => {
      cartsRepository.getUserCart = jest.fn(async () => mockCart);
      productsService.getProduct = jest.fn(async () => ({
        ...mockProduct,
        availableQuantity: 0,
      }));

      await expect(
        cartsService.addProductToCart(productToCartDto, userId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserCart', () => {
    test('should return user cart if it exists', async () => {
      cartsRepository.getUserCart = jest.fn(async () => mockCart);

      expect(await cartsService.getUserCart(userId)).toEqual(mockCart);
      expect(cartsRepository.getUserCart).toHaveBeenCalledWith(userId);
    });

    test('should throw NotFoundException if cart does not exist', async () => {
      cartsRepository.getUserCart = jest.fn(async () => null);

      await expect(cartsService.getUserCart(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProductFromCard', () => {
    test('should delete product from cart if quantity is 0 or not provided', async () => {
      cartsRepository.getUserProductInCart = jest.fn(
        async () => [mockCartProduct] as any,
      );
      cartsRepository.deleteProductFromCart = jest.fn();

      await cartsService.deleteProductFromCard(
        { ...productToCartDto, quantity: undefined },
        userId,
      );

      expect(cartsRepository.getUserProductInCart).toHaveBeenCalledWith(
        productToCartDto.productId,
        userId,
      );
      expect(cartsRepository.deleteProductFromCart).toHaveBeenCalledWith(
        productToCartDto.productId,
        userId,
      );
    });

    test('should update product quantity if it is greater than 0', async () => {
      const product = { ...mockCartProduct, quantity: 3 } as any;
      cartsRepository.getUserProductInCart = jest.fn(async () => product);
      cartsRepository.updateProductInCart = jest.fn();

      await cartsService.deleteProductFromCard(productToCartDto, userId);

      expect(cartsRepository.updateProductInCart).toHaveBeenCalledWith(
        userId,
        productToCartDto.productId,
        product.quantity - productToCartDto.quantity,
      );
    });

    test('should throw NotFoundException if product is not in the cart', async () => {
      cartsRepository.getUserProductInCart = jest.fn(async () => null);

      await expect(
        cartsService.deleteProductFromCard(productToCartDto, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('applyDiscountToCart', () => {
    test('should apply discount if cart and discount are valid', async () => {
      cartsService.getUserCart = jest.fn(async () => mockCart);
      discountsService.getDiscount = jest.fn(async () => mockDiscount);
      cartsRepository.applyDiscountToCart = jest.fn();

      await cartsService.applyDiscountToCart(applyDiscountDto, userId);

      expect(cartsService.getUserCart).toHaveBeenCalledWith(userId);
      expect(discountsService.getDiscount).toHaveBeenCalledWith(
        applyDiscountDto.code,
      );
      expect(cartsRepository.applyDiscountToCart).toHaveBeenCalledWith(
        mockCart.id,
        mockDiscount.id,
      );
    });

    test('should throw ForbiddenException if cartId does not match', async () => {
      cartsService.getUserCart = jest.fn(async () => mockCart);
      discountsService.getDiscount = jest.fn(async () => mockDiscount);

      await expect(
        cartsService.applyDiscountToCart(
          { ...applyDiscountDto, cartId: mockCart.id + 1 },
          userId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
