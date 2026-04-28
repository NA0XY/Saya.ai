export interface ExtractedMedicine {
  drug_name: string;
  dosage: string | null;
  frequency: string | null;
  route: string | null;
  low_confidence: boolean;
}

export interface NerResult {
  medicines: ExtractedMedicine[];
  raw_response: string;
}
