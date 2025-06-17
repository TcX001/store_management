import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';              
import { DatabaseModule } from './shared/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

import { UserModule } from './modules/users/user.module';
import { ProductModule } from './modules/products/product.module';
import { OrderModule } from './modules/orders/order.module';
import { OrderitemModule } from './modules/orderitems/orderitem.module';
import { CacheModule } from './cache/cache.module';
import { EmailQueueModule } from './modules/email-queues/email-queue.module';
import {AuthModule} from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,       
    }),

    DatabaseModule.forRoot({ configKey: 'database' }), 
    DatabaseModule.forRoot({ configKey: 'sqlite' }),  
    
    ProductModule,
    CacheModule,
    UserModule,
    OrderModule,
    OrderitemModule,
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
