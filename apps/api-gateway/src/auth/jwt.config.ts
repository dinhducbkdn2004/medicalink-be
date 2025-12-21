import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

export const jwtModuleAsyncOptions: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET', {
      infer: true,
    }),
    signOptions: {
      expiresIn: +configService.getOrThrow<number>('JWT_EXPIRES_IN', {
        infer: true,
      }),
    },
  }),
  inject: [ConfigService],
};
