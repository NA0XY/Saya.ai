type MaybeConfidence = { low_confidence?: unknown };

export function isLowConfidenceField(field: unknown): boolean {
  return typeof field === 'object' && field !== null && (field as MaybeConfidence).low_confidence === true;
}

export function countLowConfidenceFields(nerResult: object): number {
  let count = 0;
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value === 'object' && value !== null) {
      if (isLowConfidenceField(value)) count += 1;
      Object.values(value as Record<string, unknown>).forEach(visit);
    }
  };
  visit(nerResult);
  return count;
}

export function shouldRequireManualReview(nerResult: object): boolean {
  const medicines = (nerResult as { medicines?: Array<{ drug_name?: string; low_confidence?: boolean }> }).medicines;
  if (!Array.isArray(medicines) || medicines.length === 0) return true;
  return medicines.some((medicine) => !medicine.drug_name || medicine.low_confidence === true) || countLowConfidenceFields(nerResult) > 0;
}
