import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../auth/permission.service';

@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  constructor(private readonly permissionService: PermissionService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Inject PermissionService into request context for PermissionGuard
    req['permissionService'] = this.permissionService;
    next();
  }
}
