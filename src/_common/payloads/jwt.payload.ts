import { UserTypes } from '../enums/UserTypes.enums';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserTypes;
}
