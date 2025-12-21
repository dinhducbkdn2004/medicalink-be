export interface JwtPayloadDto {
  email: string;
  sub: string;
  tenant: string; // For multi-tenant support
  ver: number; // Auth version for cache invalidation
  iat?: number;
  exp?: number;
}
