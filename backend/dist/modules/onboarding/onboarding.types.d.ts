import { z } from 'zod';
export declare const CreatePatientSchema: z.ZodObject<{
    full_name: z.ZodString;
    phone: z.ZodString;
    date_of_birth: z.ZodOptional<z.ZodString>;
    language_preference: z.ZodDefault<z.ZodEnum<["hi", "en"]>>;
    companion_tone: z.ZodDefault<z.ZodEnum<["warm", "formal", "playful"]>>;
}, "strip", z.ZodTypeAny, {
    full_name: string;
    phone: string;
    language_preference: "hi" | "en";
    companion_tone: "warm" | "formal" | "playful";
    date_of_birth?: string | undefined;
}, {
    full_name: string;
    phone: string;
    language_preference?: "hi" | "en" | undefined;
    companion_tone?: "warm" | "formal" | "playful" | undefined;
    date_of_birth?: string | undefined;
}>;
export declare const CreateContactSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    relationship: z.ZodString;
    can_receive_escalation_sms: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    name: string;
    relationship: string;
    can_receive_escalation_sms: boolean;
}, {
    phone: string;
    name: string;
    relationship: string;
    can_receive_escalation_sms?: boolean | undefined;
}>;
export declare const OnboardingSchema: z.ZodObject<{
    full_name: z.ZodString;
    phone: z.ZodString;
    date_of_birth: z.ZodOptional<z.ZodString>;
    language_preference: z.ZodDefault<z.ZodEnum<["hi", "en"]>>;
    companion_tone: z.ZodDefault<z.ZodEnum<["warm", "formal", "playful"]>>;
} & {
    contacts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        relationship: z.ZodString;
        can_receive_escalation_sms: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        phone: string;
        name: string;
        relationship: string;
        can_receive_escalation_sms: boolean;
    }, {
        phone: string;
        name: string;
        relationship: string;
        can_receive_escalation_sms?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    full_name: string;
    phone: string;
    language_preference: "hi" | "en";
    companion_tone: "warm" | "formal" | "playful";
    contacts: {
        phone: string;
        name: string;
        relationship: string;
        can_receive_escalation_sms: boolean;
    }[];
    date_of_birth?: string | undefined;
}, {
    full_name: string;
    phone: string;
    contacts: {
        phone: string;
        name: string;
        relationship: string;
        can_receive_escalation_sms?: boolean | undefined;
    }[];
    language_preference?: "hi" | "en" | undefined;
    companion_tone?: "warm" | "formal" | "playful" | undefined;
    date_of_birth?: string | undefined;
}>;
export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
//# sourceMappingURL=onboarding.types.d.ts.map