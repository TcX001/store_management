import { Injectable, NestMiddleware, OnModuleInit, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware, OnModuleInit {
  private logStream: fs.WriteStream;
  private readonly logger = new Logger('HTTP');

  onModuleInit() {
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, 'access.log');

    fs.mkdirSync(logDir, { recursive: true });
    this.logStream = fs.createWriteStream(logFile, { flags: 'a' });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`;

      this.logStream.write(log + '\n');

      this.logger.log(log);
    });

    next();
  }
}
