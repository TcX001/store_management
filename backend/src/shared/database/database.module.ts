import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

interface DatabaseModuleOptions {
  configKey: string;
}

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    const typeOrmAsyncOptions: TypeOrmModuleAsyncOptions = {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get(options.configKey);
        if (!dbConfig) {
          throw new Error(
            `Configuration for key '${options.configKey}' not found.`,
          );
        }
        return dbConfig;
      },
      inject: [ConfigService],
    };

    return {
      module: DatabaseModule,
      imports: [TypeOrmModule.forRootAsync(typeOrmAsyncOptions)],
      exports: [TypeOrmModule],
    };
  }
}