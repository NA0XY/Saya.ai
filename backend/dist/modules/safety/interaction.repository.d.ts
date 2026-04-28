import type { DrugInteraction } from '../../types/database';
type InteractionInsert = Omit<DrugInteraction, 'id' | 'created_at'>;
export declare const interactionRepository: {
    findInteractionsByDrugNames(drugNames: string[]): Promise<DrugInteraction[]>;
    findAllDrugs(): Promise<DrugInteraction[]>;
    upsertInteraction(data: InteractionInsert): Promise<DrugInteraction>;
};
export {};
//# sourceMappingURL=interaction.repository.d.ts.map