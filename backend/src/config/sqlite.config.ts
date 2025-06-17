import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('sqlite', () => ({
  name: 'sqlite_connection',
  type: 'sqlite' as const,
  database: join(__dirname, '..', '..', '..', 'db', 'database.sqlite'),
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
}));