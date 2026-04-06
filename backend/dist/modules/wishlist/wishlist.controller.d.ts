import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
export declare const getAll: (req: AuthRequest, res: Response) => Promise<void>;
export declare const add: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const remove: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const check: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=wishlist.controller.d.ts.map