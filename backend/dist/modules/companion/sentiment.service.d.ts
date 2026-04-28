import type { ApprovedContact } from '../../types/database';
import type { Language, SentimentTag } from '../../types/common';
export declare function shouldEscalateForConsecutiveNegativeSentiments(currentSentiment: SentimentTag, previousUserSentiment: SentimentTag | null): boolean;
export declare const sentimentService: {
    analyzeSentiment(message: string, _language: Language): Promise<SentimentTag>;
    checkAndEscalate(patientId: string, currentSentiment: SentimentTag, contacts: ApprovedContact[], patientName: string): Promise<boolean>;
};
//# sourceMappingURL=sentiment.service.d.ts.map