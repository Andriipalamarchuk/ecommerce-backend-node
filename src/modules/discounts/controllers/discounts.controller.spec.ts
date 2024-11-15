import { DiscountsController } from './discounts.controller';
import { DiscountsService } from '../services/discounts.service';
import { CreateDiscountDto } from '../dtos/create-discount.dto';
import { IDiscount } from '../interfaces/discount.interface';
import { DiscountEnum } from '../enums/discount.enum';

describe('DiscountsController', () => {
  let discountsController: DiscountsController;
  let discountsService: Partial<DiscountsService>;

  const mockDiscount: IDiscount = {
    id: 1,
    code: 'SAVE10',
    value: 10,
    validFrom: new Date(),
    validTo: new Date(),
    type: DiscountEnum.PERCENTAGE,
  };

  beforeEach(async () => {
    discountsService = {};

    discountsController = new DiscountsController(
      discountsService as DiscountsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllDiscounts', async () => {
    discountsService.getAllDiscounts = jest.fn(async () => [mockDiscount]);

    expect(await discountsController.getAllDiscounts()).toEqual([mockDiscount]);
    expect(discountsService.getAllDiscounts).toHaveBeenCalled();
  });

  test('getDiscount', async () => {
    discountsService.getDiscount = jest.fn(async () => mockDiscount);

    expect(await discountsController.getDiscount(mockDiscount.code)).toEqual(
      mockDiscount,
    );
    expect(discountsService.getDiscount).toHaveBeenCalledWith(
      mockDiscount.code,
    );
  });

  test('createDiscount', async () => {
    const createDiscountDto: CreateDiscountDto = {
      code: 'SAVE20',
      value: 20,
      validTo: new Date(),
      validFrom: new Date(),
      type: DiscountEnum.PERCENTAGE,
    };

    discountsService.createDiscount = jest.fn(async () => mockDiscount);

    expect(await discountsController.createDiscount(createDiscountDto)).toEqual(
      mockDiscount,
    );
    expect(discountsService.createDiscount).toHaveBeenCalledWith(
      createDiscountDto,
    );
  });

  describe('', () => {
    test('deleteDiscount', async () => {
      discountsService.deleteDiscount = jest.fn();

      await discountsController.deleteDiscount(mockDiscount.id);

      expect(discountsService.deleteDiscount).toHaveBeenCalledWith(
        mockDiscount.id,
      );
    });
  });
});
