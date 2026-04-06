import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
export declare const getCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const clearCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const syncCart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=cart.controller.d.ts.map