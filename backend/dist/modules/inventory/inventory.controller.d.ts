import { Request, Response } from "express";
export declare const getStockLevels: (req: Request, res: Response) => Promise<void>;
export declare const getSummary: (_req: Request, res: Response) => Promise<void>;
export declare const getTransactions: (req: Request, res: Response) => Promise<void>;
export declare const updateStock: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=inventory.controller.d.ts.map