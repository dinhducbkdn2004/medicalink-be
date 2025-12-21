import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtPayloadDto } from '../dtos/auth';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class MicroserviceJwtGuard implements CanActivate {
  private readonly logger = new Logger(MicroserviceJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const data = context.switchToRpc().getData();
    const token: string = data?.authorization || data?.token;

    if (!token) {
      this.logger.warn('No token provided in microservice request');
      throw new UnauthorizedException('Access token is required');
    }

    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken: string = token.startsWith('Bearer ')
        ? token.slice(7)
        : token;

      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(
        cleanToken,
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET', {
            infer: true,
          }),
        },
      );

      // Attach user information to the data
      data.user = payload;
      return true;
    } catch (error) {
      this.logger.warn(`JWT verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
