import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/orderitem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem]),
  ],
  providers: [],
  controllers: [],
})
export class OrderitemModule {}
