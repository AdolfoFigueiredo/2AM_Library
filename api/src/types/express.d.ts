// src/types/express.d.ts
import { TokenPayload } from "../auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
