export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
export type Language = 'hi' | 'en';
export type Severity = 'high' | 'moderate' | 'low';
export type SentimentTag = 'joy' | 'neutral' | 'anxiety' | 'sadness';
export type CallStatus = 'pending' | 'initiated' | 'answered' | 'confirmed' | 'rejected' | 'no_answer' | 'failed';
export type InteractionType = 'food' | 'drug';
//# sourceMappingURL=common.d.ts.map