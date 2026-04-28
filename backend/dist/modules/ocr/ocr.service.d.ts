import type { NerResult } from '../ner/ner.types';
import type { OcrResult } from './ocr.types';
export declare const ocrService: {
    processPrescritionImage(filePath: string, _mimeType: string): Promise<{
        ocrResult: OcrResult;
        nerResult: NerResult;
    }>;
    saveOcrResult(prescriptionId: string, rawText: string): Promise<void>;
};
//# sourceMappingURL=ocr.service.d.ts.map