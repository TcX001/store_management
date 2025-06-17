import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from './entities/orderitem.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

@Injectable()
export class OrderItemsService {

  async createItemsForOrder(
    items: CreateOrderItemDto[],
    order: Order,
    manager: EntityManager,
  ): Promise<OrderItem[]> {
    const orderItemsInstances = await Promise.all(
      items.map(async (itemDto) => {
        // ค้นหาสินค้าด้วย pessimistic_write lock เพื่อป้องกันการซื้อสินค้าชิ้นเดียวกันพร้อมกัน (Race Condition)
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId },
          lock: { mode: 'pessimistic_write' },
        });

        // ตรวจสอบว่ามีสินค้าจริงหรือไม่
        if (!product) {
          throw new NotFoundException(`ไม่พบสินค้า ID: ${itemDto.productId}`);
        }

        // ตรวจสอบสต็อกสินค้า
        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `สินค้า '${product.name}' มีไม่เพียงพอ (คงเหลือ: ${product.stock})`,
          );
        }

        product.stock -= itemDto.quantity;
        await manager.save(product);

        const newOrderItem = new OrderItem();
        newOrderItem.product = product;
        newOrderItem.quantity = itemDto.quantity;
        newOrderItem.price = product.price; // ใช้ราคาจากฐานข้อมูลเพื่อความถูกต้อง
        newOrderItem.order = order;

        return newOrderItem;
      }),
    );

    return manager.save(orderItemsInstances);
  }
}