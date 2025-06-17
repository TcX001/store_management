import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/orderitem.entity';
import { OrderItemsService } from './order-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem]),
  ],
  providers: [OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderitemModule {}
