import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from './auth.types';
export declare const authService: {
    register(input: RegisterInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    getUserById(id: string): Promise<AuthUser>;
};
//# sourceMappingURL=auth.service.d.ts.map