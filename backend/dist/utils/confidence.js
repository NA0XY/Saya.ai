"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLowConfidenceField = isLowConfidenceField;
exports.countLowConfidenceFields = countLowConfidenceFields;
exports.shouldRequireManualReview = shouldRequireManualReview;
function isLowConfidenceField(field) {
    return typeof field === 'object' && field !== null && field.low_confidence === true;
}
function countLowConfidenceFields(nerResult) {
    let count = 0;
    const visit = (value) => {
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (typeof value === 'object' && value !== null) {
            if (isLowConfidenceField(value))
                count += 1;
            Object.values(value).forEach(visit);
        }
    };
    visit(nerResult);
    return count;
}
function shouldRequireManualReview(nerResult) {
    const medicines = nerResult.medicines;
    if (!Array.isArray(medicines) || medicines.length === 0)
        return true;
    return medicines.some((medicine) => !medicine.drug_name || medicine.low_confidence === true) || countLowConfidenceFields(nerResult) > 0;
}
//# sourceMappingURL=confidence.js.map