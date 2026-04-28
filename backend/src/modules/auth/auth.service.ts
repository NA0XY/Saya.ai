import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { supabase } from '../../config/supabase';
import type { User } from '../../types/database';
import { ApiError } from '../../utils/apiError';
import { toE164India } from '../../utils/phone';
import type { AuthResponse, AuthUser, LoginInput, RegisterInput, TokenPayload } from './auth.types';

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email, full_name: user.full_name, phone: user.phone, role: user.role };
}

function signToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase();
    const existing = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing.error) throw ApiError.internal('Failed to check existing user');
    if (existing.data) throw ApiError.conflict('Email is already registered');
    const passwordHash = await bcrypt.hash(input.password, 12);
    const { data, error } = await supabase.from('users').insert({ email, password_hash: passwordHash, full_name: input.full_name, phone: toE164India(input.phone), role: 'caregiver' }).select('*').single();
    if (error || !data) throw ApiError.internal('Failed to create user');
    const user = toAuthUser(data);
    return { user, token: signToken({ id: user.id, email: user.email, role: user.role }) };
  },
  async login(input: LoginInput): Promise<AuthResponse> {
    const { data, error } = await supabase.from('users').select('*').eq('email', input.email.toLowerCase()).maybeSingle();
    if (error) throw ApiError.internal('Failed to load user');
    if (!data) throw ApiError.unauthorized('Invalid credentials');
    const matches = await bcrypt.compare(input.password, data.password_hash);
    if (!matches) throw ApiError.unauthorized('Invalid credentials');
    const user = toAuthUser(data);
    return { user, token: signToken({ id: user.id, email: user.email, role: user.role }) };
  },
  async getUserById(id: string): Promise<AuthUser> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw ApiError.internal('Failed to load user');
    if (!data) throw ApiError.notFound('User');
    return toAuthUser(data);
  }
};
