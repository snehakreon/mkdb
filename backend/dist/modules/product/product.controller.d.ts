import { Request, Response } from "express";
export declare const getAll: (req: Request, res: Response) => Promise<void>;
export declare const getActive: (req: Request, res: Response) => Promise<void>;
export declare const getFilters: (req: Request, res: Response) => Promise<void>;
export declare const getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getLowStock: (req: Request, res: Response) => Promise<void>;
export declare const getInventorySummary: (_req: Request, res: Response) => Promise<void>;
export declare const remove: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=product.controller.d.ts.map