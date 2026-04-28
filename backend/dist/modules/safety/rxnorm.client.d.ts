interface RxNormConceptProperty {
    name?: string;
}
interface RxNormConceptGroup {
    tty?: string;
    conceptProperties?: RxNormConceptProperty[];
}
interface RxNormRelatedResponse {
    allRelatedGroup?: {
        conceptGroup?: RxNormConceptGroup[];
    };
}
export declare function extractRxNormNames(response: RxNormRelatedResponse): string[];
export declare const rxNormClient: {
    resolveRxCui(drugName: string): Promise<string | null>;
    fetchNormalizedNames(drugName: string): Promise<string[]>;
};
export {};
//# sourceMappingURL=rxnorm.client.d.ts.map