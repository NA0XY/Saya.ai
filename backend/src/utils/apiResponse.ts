export function successResponse<T>(data: T, message = 'Success') {
  return { success: true as const, message, data };
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    success: true as const,
    data,
    pagination: { total, page, limit, hasMore: page * limit < total }
  };
}
