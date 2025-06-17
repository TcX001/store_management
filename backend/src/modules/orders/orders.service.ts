import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../orderitems/entities/orderitem.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CacheService } from '../../cache/cache.service'; 

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['user', 'items', 'items.product'] });
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

      const orderItems = await Promise.all(items.map(async (item) => {

        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`ไม่พบสินค้า ID: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`สินค้า '${product.name}' มีไม่เพียงพอ (คงเหลือ: ${product.stock})`);
        }

        product.stock -= item.quantity;
        await queryRunner.manager.save(product); 

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = item.quantity;
        orderItem.price = product.price;
        orderItem.order = savedOrder;
        return orderItem;
      }));

      await queryRunner.manager.save(orderItems);
      
      await queryRunner.commitTransaction();

    console.log('Order successful, invalidating product cache...');
      await this.cacheService.del('products:all')

      for (const item of createOrderDto.items) {
        const cacheKey = `product:${item.productId}`;
        await this.cacheService.del(cacheKey); 
        console.log(`CACHE INVALIDATED: ${cacheKey} 🗑️`);
      }

      const order = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['user', 'items', 'items.product'],
      });

      if (!order) {
        throw new NotFoundException(`ไม่พบคำสั่งซื้อ ID: ${savedOrder.id}`);
      }

      return order;

    } catch (err) {
      
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {

        await queryRunner.release();
    }
  }
}