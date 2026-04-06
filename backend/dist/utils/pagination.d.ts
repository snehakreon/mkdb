import { Request } from "express";
export interface PaginationParams {
    page: number;
    limit: number;
    pageSize?: number;
    offset: number;
    search?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
/**
 * Extract pagination params from request query.
 * Defaults: page=1, limit=20, max limit=100
 */
export declare function getPaginationParams(req: Request): PaginationParams;
/**
 * Build a paginated response envelope.
 */
export declare function paginatedResponse<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T>;
export declare const parsePagination: typeof getPaginationParams;
export declare const buildPaginatedResponse: typeof paginatedResponse;
//# sourceMappingURL=pagination.d.ts.map