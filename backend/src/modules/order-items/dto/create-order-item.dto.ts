import { IsInt, IsPositive, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt({ message: 'productId must be an integer' })
  productId: number;

  @IsInt({ message: 'quantity must be an integer' })
  @IsPositive({ message: 'quantity must be a positive number' })
  @Min(1, { message: 'quantity must be at least 1' })
  quantity: number;
}
