export declare function successResponse<T>(data: T, message?: string): {
    success: true;
    message: string;
    data: T;
};
export declare function paginatedResponse<T>(data: T[], total: number, page: number, limit: number): {
    success: true;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    };
};
//# sourceMappingURL=apiResponse.d.ts.map