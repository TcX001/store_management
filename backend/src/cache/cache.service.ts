import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly config: ConfigService) {}

onModuleInit() {
  this.client = new Redis({
    host: this.config.get<string>('REDIS_HOST', 'redis'),  
    port: this.config.get<number>('REDIS_PORT', 6379),
    password: this.config.get<string>('REDIS_PASSWORD'),
    db: this.config.get<number>('REDIS_DB', 0),
  });
}

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set(
    key: string,
    value: any,
  ): Promise<'OK' | null> {
    const payload = JSON.stringify(value);

    return this.client.set(key, payload);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
}
