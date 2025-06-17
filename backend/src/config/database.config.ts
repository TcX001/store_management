import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'nestjs_db',
  synchronize: true,
  autoLoadEntities: true,
}));