import type { Language } from '../../types/common';
import type { TtsRequest } from './call.types';
export declare const ttsService: {
    synthesizeSpeech(request: TtsRequest): Promise<Buffer>;
    synthesizeToUrl(text: string, language: Language, scheduleId: string): Promise<string>;
};
//# sourceMappingURL=tts.service.d.ts.map