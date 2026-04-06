import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
export declare const getAll: (req: AuthRequest, res: Response) => Promise<void>;
export declare const create: (req: AuthRequest, res: Response) => Promise<void>;
export declare const update: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const remove: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=address.controller.d.ts.map