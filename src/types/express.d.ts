import { Request } from 'express';
import { UserTypes } from '../_common/enums/UserTypes.enums';

// JwtPayload'ın tipi
interface JwtPayload {
  id: number;
  email: string;
  role: UserTypes;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
