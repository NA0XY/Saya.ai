"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingSchema = exports.CreateContactSchema = exports.CreatePatientSchema = void 0;
const zod_1 = require("zod");
exports.CreatePatientSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(10),
    date_of_birth: zod_1.z.string().optional(),
    language_preference: zod_1.z.enum(['hi', 'en']).default('hi'),
    companion_tone: zod_1.z.enum(['warm', 'formal', 'playful']).default('warm')
});
exports.CreateContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(10),
    relationship: zod_1.z.string().min(2),
    can_receive_escalation_sms: zod_1.z.boolean().optional().default(true)
});
exports.OnboardingSchema = exports.CreatePatientSchema.extend({
    contacts: zod_1.z.array(exports.CreateContactSchema).min(1).max(5)
});
//# sourceMappingURL=onboarding.types.js.map