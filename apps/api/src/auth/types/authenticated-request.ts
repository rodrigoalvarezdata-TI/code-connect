import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload';

/** Request após o AuthGuard ter verificado o token e anexado o payload. */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
