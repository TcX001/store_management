import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CacheService } from '../../shared/cache/cache.service';
import { OrderItemsService } from '../order-items/order-items.service'; 

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    private readonly orderItemsService: OrderItemsService, 
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
    });
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userId, items } = createOrderDto;

      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      if (!user) {
        throw new NotFoundException(`ไม่พบผู้ใช้งาน ID: ${userId}`);
      }

      const newOrder = new Order();
      newOrder.user = user;
      const savedOrder = await queryRunner.manager.save(newOrder);

      await this.orderItemsService.createItemsForOrder(
        items,
        savedOrder,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      console.log('Order successful, invalidating product cache...');
      await this.cacheService.del('products:all');

      for (const item of createOrderDto.items) {
        const cacheKey = `products:${item.productId}`;
        console.log(cacheKey);
        await this.cacheService.del(cacheKey);
        console.log(`CACHE INVALIDATED: ${cacheKey} 🗑️`);
      }

      const finalOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['user', 'items', 'items.product'],
      });

      if (!finalOrder) {
        throw new NotFoundException(`ไม่พบคำสั่งซื้อ ID: ${savedOrder.id} หลังสร้างเสร็จ`);
      }

      return finalOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}