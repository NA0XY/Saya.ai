"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateScheduleSchema = void 0;
const zod_1 = require("zod");
exports.CreateScheduleSchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid(),
    medicine_name: zod_1.z.string().min(2),
    scheduled_time: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    custom_message: zod_1.z.string().max(200).optional(),
    language: zod_1.z.enum(['hi', 'en']).default('hi')
});
//# sourceMappingURL=medication.types.js.map