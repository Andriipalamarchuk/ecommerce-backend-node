import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products.repository';
import { AddProductDto } from '../dtos/add-product.dto';
import { IProduct } from '../interfaces/product.interface';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: Partial<ProductsRepository>;

  const mockProduct: IProduct = {
    id: 1,
    createdAt: new Date(),
    price: 100,
    availableQuantity: 10,
    description: 'Test product description',
  };

  beforeEach(() => {
    productsRepository = {};

    productsService = new ProductsService(
      productsRepository as ProductsRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProduct', () => {
    test('should return a product if it exists', async () => {
      productsRepository.getProduct = jest.fn(async () => mockProduct);

      expect(await productsService.getProduct(mockProduct.id)).toEqual(
        mockProduct,
      );
      expect(productsRepository.getProduct).toHaveBeenCalledWith(
        mockProduct.id,
      );
    });

    test('should throw NotFoundException if the product does not exist', async () => {
      productsRepository.getProduct = jest.fn(async () => null);

      await expect(productsService.getProduct(mockProduct.id)).rejects.toThrow(
        NotFoundException,
      );

      expect(productsRepository.getProduct).toHaveBeenCalledWith(
        mockProduct.id,
      );
    });
  });

  describe('getProducts', () => {
    test('should return a list of products', async () => {
      productsRepository.getProducts = jest.fn(async () => [mockProduct]);

      const page = 1;
      const pageSize = 10;

      expect(await productsService.getProducts(page, pageSize)).toEqual([
        mockProduct,
      ]);
      expect(productsRepository.getProducts).toHaveBeenCalledWith(
        page,
        pageSize,
      );
    });
  });

  describe('addProduct', () => {
    test('should add a product successfully', async () => {
      const addProductDto: AddProductDto = {
        price: 50,
        availableQuantity: 20,
        description: 'A new product',
      };

      productsRepository.addProduct = jest.fn(async () => mockProduct);

      expect(await productsService.addProduct(addProductDto)).toEqual(
        mockProduct,
      );
      expect(productsRepository.addProduct).toHaveBeenCalledWith(addProductDto);
    });
  });
});
