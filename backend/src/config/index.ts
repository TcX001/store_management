import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import sqliteConfig from './sqlite.config';

export {
  databaseConfig as DatabaseConfig,
  jwtConfig as JwtConfig,
  sqliteConfig as SqliteConfig,
};

export default [
  databaseConfig,
  jwtConfig,
  sqliteConfig,
];