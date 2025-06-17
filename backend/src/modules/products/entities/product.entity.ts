import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,   // เพิ่ม
  OneToMany,
  Relation,
} from 'typeorm';
import { OrderItem } from '../../orderitems/entities/orderitem.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ length: 50, nullable: true })
  category?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })  
  deletedAt?: Date;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: Relation<OrderItem>[];
}
