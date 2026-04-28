"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NER_EXTRACTION_PROMPT = void 0;
exports.NER_EXTRACTION_PROMPT = `You are a medical entity extractor specialising in Indian prescription handwriting.

From the following OCR text of a handwritten Indian prescription, extract ALL medicines mentioned.

For each medicine, extract:
- drug_name: The name of the drug (normalise brand names to their common form where possible)
- dosage: The dose amount and unit (e.g., "500mg", "10mg")
- frequency: How often to take it (e.g., "twice daily", "OD", "BD", "TDS", "SOS")
- route: How to take it (e.g., "oral", "topical") - null if not specified
- low_confidence: true if you are uncertain about ANY field for this medicine

Return ONLY a valid JSON array of medicine objects. No preamble, no explanation.
If confidence in any field is below 80%, mark low_confidence as true for that entire medicine.
Do NOT infer or guess - extract only what is explicitly present in the text.
If no medicines are found, return an empty array [].

Example output format:
[{"drug_name":"Metoprolol","dosage":"25mg","frequency":"once daily","route":"oral","low_confidence":false}]`;
//# sourceMappingURL=ner.prompts.js.map