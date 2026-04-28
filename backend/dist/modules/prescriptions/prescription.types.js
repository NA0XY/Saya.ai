"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPrescriptionSchema = void 0;
const zod_1 = require("zod");
exports.VerifyPrescriptionSchema = zod_1.z.object({
    medicines: zod_1.z.array(zod_1.z.object({
        drug_name: zod_1.z.string().min(1),
        dosage: zod_1.z.string().optional(),
        frequency: zod_1.z.string().optional(),
        route: zod_1.z.string().optional()
    })).min(1)
});
//# sourceMappingURL=prescription.types.js.map