import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Auth } from '../../auths/entities/auth.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: true })
  type: boolean; 

  @OneToMany(() => Order, (order) => order.user)
  orders: Relation<Order>[];

@OneToMany(() => Auth, (auth) => auth.user)
tokens: Relation<Auth[]>;
}
