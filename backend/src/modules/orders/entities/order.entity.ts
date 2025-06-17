import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Relation,
  ManyToOne,
} from 'typeorm';
import  { OrderItem } from '../../orderitems/entities/orderitem.entity';
import  { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.orders)
  user: Relation<User>;

  @OneToMany(() => OrderItem, (OrderItem) => OrderItem.order, {
    cascade: true,     
  })
  items: Relation<OrderItem>[];
}
