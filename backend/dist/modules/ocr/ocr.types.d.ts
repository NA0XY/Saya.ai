export interface OcrResult {
    rawText: string;
    confidence: number | null;
    error?: string;
}
export interface OcrRequest {
    filePath: string;
    mimeType: string;
}
//# sourceMappingURL=ocr.types.d.ts.map