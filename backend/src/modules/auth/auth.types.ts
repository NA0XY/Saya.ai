import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Password must contain an uppercase letter').regex(/[0-9]/, 'Password must contain a number'),
  full_name: z.string().min(2),
  phone: z.string().min(10)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

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
