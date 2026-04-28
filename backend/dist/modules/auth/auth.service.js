"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const supabase_1 = require("../../config/supabase");
const apiError_1 = require("../../utils/apiError");
const phone_1 = require("../../utils/phone");
function toAuthUser(user) {
    return { id: user.id, email: user.email, full_name: user.full_name, phone: user.phone, role: user.role };
}
function signToken(payload) {
    const options = { expiresIn: env_1.env.JWT_EXPIRES_IN };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
}
exports.authService = {
    async register(input) {
        const email = input.email.toLowerCase();
        const existing = await supabase_1.supabase.from('users').select('id').eq('email', email).maybeSingle();
        if (existing.error)
            throw apiError_1.ApiError.internal('Failed to check existing user');
        if (existing.data)
            throw apiError_1.ApiError.conflict('Email is already registered');
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        const { data, error } = await supabase_1.supabase.from('users').insert({ email, password_hash: passwordHash, full_name: input.full_name, phone: (0, phone_1.toE164India)(input.phone), role: 'caregiver' }).select('*').single();
        if (error || !data)
            throw apiError_1.ApiError.internal('Failed to create user');
        const user = toAuthUser(data);
        return { user, token: signToken({ id: user.id, email: user.email, role: user.role }) };
    },
    async login(input) {
        const { data, error } = await supabase_1.supabase.from('users').select('*').eq('email', input.email.toLowerCase()).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load user');
        if (!data)
            throw apiError_1.ApiError.unauthorized('Invalid credentials');
        const matches = await bcryptjs_1.default.compare(input.password, data.password_hash);
        if (!matches)
            throw apiError_1.ApiError.unauthorized('Invalid credentials');
        const user = toAuthUser(data);
        return { user, token: signToken({ id: user.id, email: user.email, role: user.role }) };
    },
    async getUserById(id) {
        const { data, error } = await supabase_1.supabase.from('users').select('*').eq('id', id).maybeSingle();
        if (error)
            throw apiError_1.ApiError.internal('Failed to load user');
        if (!data)
            throw apiError_1.ApiError.notFound('User');
        return toAuthUser(data);
    }
};
//# sourceMappingURL=auth.service.js.map