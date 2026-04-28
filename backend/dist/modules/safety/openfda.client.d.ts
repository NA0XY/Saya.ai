import type { DrugInteraction } from '../../types/database';
interface OpenFdaLabel {
    openfda?: {
        brand_name?: string[];
        generic_name?: string[];
        substance_name?: string[];
    };
    drug_interactions?: string[];
    warnings?: string[];
}
export declare function mapOpenFdaLabelToInteractions(drugName: string, label: OpenFdaLabel): DrugInteraction[];
export declare const openFdaClient: {
    fetchInteractions(drugName: string): Promise<DrugInteraction[]>;
};
export {};
//# sourceMappingURL=openfda.client.d.ts.map