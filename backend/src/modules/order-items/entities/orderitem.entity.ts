import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Relation,
} from 'typeorm';
import  { Order } from '../../orders/entities/order.entity';
import  { Product } from '../../products/entities/product.entity';

@Entity('orderitems')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  order: Relation<Order>;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    eager: true,       
    onDelete: 'SET NULL',
  })
  product: Relation<Product>;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
