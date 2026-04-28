import { z } from 'zod';
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    full_name: z.ZodString;
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    full_name: string;
    phone: string;
}, {
    email: string;
    password: string;
    full_name: string;
    phone: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role: 'caregiver' | 'admin';
}
export interface TokenPayload {
    id: string;
    email: string;
    role: 'caregiver' | 'admin';
}
export interface AuthResponse {
    user: AuthUser;
    token: string;
}
//# sourceMappingURL=auth.types.d.ts.map