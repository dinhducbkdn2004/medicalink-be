import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private morgan = morgan('[API] :method :url -> :status | :response-time ms', {
    stream: {
      write: (message: string) => {
        Logger.log(message.trim());
      },
    },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.morgan(req, res, next);
  }
}
