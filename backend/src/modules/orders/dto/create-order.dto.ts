import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsArray, ValidateNested, Min } from 'class-validator';

class OrderItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}