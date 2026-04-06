"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginatedResponse = exports.parsePagination = void 0;
exports.getPaginationParams = getPaginationParams;
exports.paginatedResponse = paginatedResponse;
/**
 * Extract pagination params from request query.
 * Defaults: page=1, limit=20, max limit=100
 */
function getPaginationParams(req) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search || undefined;
    return { page, limit, pageSize: limit, offset, search };
}
/**
 * Build a paginated response envelope.
 */
function paginatedResponse(data, total, params) {
    return {
        data,
        pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages: Math.ceil(total / params.limit),
        },
    };
}
exports.parsePagination = getPaginationParams;
exports.buildPaginatedResponse = paginatedResponse;
//# sourceMappingURL=pagination.js.map