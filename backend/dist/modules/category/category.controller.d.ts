import { Request, Response } from "express";
export declare const getAll: (req: Request, res: Response) => Promise<void>;
export declare const getActive: (_req: Request, res: Response) => Promise<void>;
export declare const create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const reorganize: (_req: Request, res: Response) => Promise<void>;
export declare const remove: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=category.controller.d.ts.map