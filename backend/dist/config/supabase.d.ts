import type { Database } from '../types/database';
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const db: <T extends keyof Database["public"]["Tables"]>(table: T) => import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, string, unknown>;
//# sourceMappingURL=supabase.d.ts.map