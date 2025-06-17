import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';              
import { DatabaseModule } from './shared/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { UserModule } from './modules/users/users.module';
import { ProductModule } from './modules/products/products.module';
import { OrderModule } from './modules/orders/orders.module';
import { OrderitemModule } from './modules/order-items/order-items.module';
import { CacheModule } from './shared/cache/cache.module';
import { EmailQueueModule } from './modules/email-queues/email-queues.module';
import {AuthModule} from './modules/auths/auths.module';

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
