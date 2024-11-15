import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { AddProductDto } from '../dtos/add-product.dto';
import { IProduct } from '../interfaces/product.interface';
import { BadRequestException } from '@nestjs/common';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: Partial<ProductsService>;

  const mockProduct: IProduct = {
    id: 1,
    createdAt: new Date(),
    price: 100,
    availableQuantity: 10,
    description: 'Test product description',
  };

  beforeEach(() => {
    productsService = {};

    productsController = new ProductsController(
      productsService as ProductsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    test('should return a list of products', async () => {
      productsService.getProducts = jest.fn(async () => [mockProduct]);

      const page = 1;
      const pageSize = 10;

      expect(await productsController.getProducts(page, pageSize)).toEqual([
        mockProduct,
      ]);
      expect(productsService.getProducts).toHaveBeenCalledWith(page, pageSize);
    });
  });

  describe('addProduct', () => {
    const addProductDto: AddProductDto = {
      price: 50,
      availableQuantity: 20,
      description: 'A new product',
    };

    test('should add a product successfully', async () => {
      productsService.addProduct = jest.fn(async () => mockProduct);

      expect(await productsController.addProduct(addProductDto)).toEqual(
        mockProduct,
      );
      expect(productsService.addProduct).toHaveBeenCalledWith(addProductDto);
    });

    test('should throw BadRequestException for invalid product price', async () => {
      const invalidProductDto = { ...addProductDto, price: 0 };
      productsService.addProduct = jest.fn();

      await expect(
        productsController.addProduct(invalidProductDto),
      ).rejects.toThrow(BadRequestException);

      expect(productsService.addProduct).not.toHaveBeenCalled();
    });

    test('should throw BadRequestException for invalid available quantity', async () => {
      const invalidProductDto = { ...addProductDto, availableQuantity: -5 };
      productsService.addProduct = jest.fn();

      await expect(
        productsController.addProduct(invalidProductDto),
      ).rejects.toThrow(BadRequestException);

      expect(productsService.addProduct).not.toHaveBeenCalled();
    });
  });
});
