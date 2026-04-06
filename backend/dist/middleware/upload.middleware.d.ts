import { Request } from "express";
declare const UPLOAD_DIR: string;
export declare const uploadImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
export declare const uploadImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
export declare const uploadDocument: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
export declare const setUploadFolder: (folder: string) => (req: Request, _res: any, next: any) => void;
export { UPLOAD_DIR };
//# sourceMappingURL=upload.middleware.d.ts.map