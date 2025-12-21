import { Throttle } from '@nestjs/throttler';

// Public creation endpoints are sensitive to spam; apply a tighter limit
export const PublicCreateThrottle = () =>
  Throttle({ default: { limit: 3, ttl: 60 } });
