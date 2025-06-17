import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';              
import { DatabaseModule } from './shared/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

import { UsersModule } from './modules/users/user.module';
import { ProductModule } from './modules/products/product.module';
import { OrdersModule } from './modules/orders/order.module';
import { OrderItemsModule } from './modules/orderitems/orderitem.module';
import { CacheModule } from './cache/cache.module';
import { EmailQueueModule } from './modules/email-queues/email-queue.module';
import {AuthModule} from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,       
    }),
    DatabaseModule,
    
    ProductModule,
    CacheModule,
    UsersModule,
    OrdersModule,
    OrderItemsModule,
    EmailQueueModule,
    AuthModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
