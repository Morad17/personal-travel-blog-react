import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    adminId?: string;
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map