"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryService = void 0;
const supabase_1 = require("../../config/supabase");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const crypto_1 = require("crypto");
const env_1 = require("../../config/env");
const apiError_1 = require("../../utils/apiError");
const groq = new groq_sdk_1.default({ apiKey: env_1.env.GROQ_API_KEY });
const VAULT_PREFIX = 'vault_';
const VAULT_NOTE_PREFIX = 'vault_note:';
const VAULT_FACT_PREFIX = 'vault_fact:';
const VAULT_OBSIDIAN_NOTE_PREFIX = 'vault_obs_note:';
const VAULT_RELATION_PREFIX = 'vault_rel:';
function isVaultMemoryKey(key) {
    return key.startsWith(VAULT_PREFIX);
}
function recencyScore(isoDate) {
    if (!isoDate)
        return 0.2;
    const timestamp = Date.parse(isoDate);
    if (!Number.isFinite(timestamp))
        return 0.2;
    const ageDays = Math.max(0, (Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    const halfLifeDays = 21;
    return Math.pow(0.5, ageDays / halfLifeDays);
}
function cosineSimilarity(a, b) {
    if (a.length !== b.length || a.length === 0)
        return -1;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let index = 0; index < a.length; index += 1) {
        dot += a[index] * b[index];
        normA += a[index] * a[index];
        normB += b[index] * b[index];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (!Number.isFinite(denominator) || denominator === 0)
        return -1;
    return dot / denominator;
}
function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64) || 'untitled';
}
function normalizeWikiTitle(value) {
    return value.trim().replace(/\s+/g, ' ');
}
function extractWikiLinks(content) {
    const links = new Set();
    const matches = content.matchAll(/\[\[([^[\]]+)\]\]/g);
    for (const match of matches) {
        const raw = match[1];
        if (!raw)
            continue;
        const title = normalizeWikiTitle(raw.split('|')[0] ?? '');
        if (title)
            links.add(title);
    }
    return Array.from(links);
}
function buildTitle(content) {
    const stripped = content
        .replace(/\[\[([^[\]]+)\]\]/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    const sentence = stripped.split(/[.!?]/)[0]?.trim() ?? stripped;
    return sentence.slice(0, 72) || 'Untitled Memory Note';
}
const STOP_WORDS = new Set([
    'about', 'after', 'again', 'being', 'because', 'could', 'would', 'there', 'their', 'while', 'where',
    'which', 'these', 'those', 'today', 'hello', 'thank', 'thanks', 'please', 'might', 'shall', 'with',
    'that', 'this', 'have', 'has', 'had', 'from', 'into', 'your', 'ours', 'they', 'them', 'been', 'were',
    'what', 'when', 'then', 'just', 'also', 'want', 'need', 'very', 'like'
]);
function extractTags(content, title) {
    const explicit = new Set();
    for (const match of content.matchAll(/#([a-zA-Z0-9_]+)/g)) {
        const tag = match[1]?.toLowerCase().trim();
        if (tag)
            explicit.add(tag);
    }
    const tokens = `${title} ${content}`
        .toLowerCase()
        .replace(/\[\[([^[\]]+)\]\]/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));
    for (const token of tokens.slice(0, 8)) {
        explicit.add(token);
    }
    return Array.from(explicit).slice(0, 12);
}
function tokenizeForOverlap(value) {
    return new Set(value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length >= 3 && !STOP_WORDS.has(token)));
}
function overlapScore(a, b) {
    if (!b?.length || !a.size)
        return 0;
    let overlap = 0;
    for (const token of b) {
        if (a.has(token.toLowerCase()))
            overlap += 1;
    }
    return Math.min(1, overlap / Math.max(3, b.length));
}
function parseVaultDocument(memory) {
    try {
        const payload = JSON.parse(memory.memory_value);
        if (!payload?.content || typeof payload.content !== 'string')
            return null;
        if (payload.embedding && !Array.isArray(payload.embedding))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
function parseVaultRelation(memory) {
    if (!memory.memory_key.startsWith(VAULT_RELATION_PREFIX))
        return null;
    try {
        const payload = JSON.parse(memory.memory_value);
        if (!payload?.from_note_id || !payload.to_title || !payload.from_title)
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
async function upsertMemoryRecord(patientId, key, value) {
    const { error } = await supabase_1.supabase
        .from('patient_memories')
        .upsert({ patient_id: patientId, memory_key: key, memory_value: value }, { onConflict: 'patient_id,memory_key' });
    if (error)
        throw apiError_1.ApiError.internal('Failed to save memory');
}
function buildNoteKey(noteId) {
    return `${VAULT_OBSIDIAN_NOTE_PREFIX}${noteId}`;
}
exports.memoryService = {
    async getMemories(patientId) {
        const { data, error } = await supabase_1.supabase
            .from('patient_memories')
            .select('*')
            .eq('patient_id', patientId)
            .not('memory_key', 'like', `${VAULT_PREFIX}%`)
            .order('memory_key');
        if (error)
            throw apiError_1.ApiError.internal('Failed to load memories');
        return data ?? [];
    },
    async getVaultMemories(patientId) {
        const { data, error } = await supabase_1.supabase
            .from('patient_memories')
            .select('*')
            .eq('patient_id', patientId)
            .like('memory_key', `${VAULT_PREFIX}%`)
            .order('updated_at', { ascending: false });
        if (error)
            throw apiError_1.ApiError.internal('Failed to load vault memories');
        return data ?? [];
    },
    async createEmbedding(input) {
        const response = await groq.embeddings.create({
            model: 'nomic-embed-text-v1_5',
            input,
            encoding_format: 'float'
        });
        const embedding = response.data[0]?.embedding;
        if (!Array.isArray(embedding))
            throw apiError_1.ApiError.badGateway('Failed to generate memory embedding', undefined, 'GROQ_EMBEDDING_FAILED');
        return embedding;
    },
    async upsertVaultEntry(patientId, key, content, role = 'fact') {
        const embedding = await this.createEmbedding(content);
        const value = {
            content,
            embedding,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        await upsertMemoryRecord(patientId, key, JSON.stringify(value));
    },
    async upsertObsidianNote(patientId, note) {
        const title = note.title.trim() || buildTitle(note.content);
        const content = note.content.trim();
        const noteId = note.noteId ?? `${slugify(title)}-${(0, crypto_1.randomUUID)().slice(0, 8)}`;
        const tags = extractTags(content, title);
        const links = extractWikiLinks(content);
        const embedding = await this.createEmbedding(`${title}\n${content}`);
        const now = new Date().toISOString();
        const payload = {
            note_id: noteId,
            title,
            content,
            tags,
            links,
            embedding,
            role: note.role ?? 'fact',
            created_at: now,
            updated_at: now
        };
        await upsertMemoryRecord(patientId, buildNoteKey(noteId), JSON.stringify(payload));
        for (const linkedTitle of links) {
            await this.upsertRelation(patientId, noteId, title, linkedTitle, 1);
            const linkedNoteKey = `${VAULT_OBSIDIAN_NOTE_PREFIX}${slugify(linkedTitle)}`;
            const linkedNotePayload = {
                note_id: slugify(linkedTitle),
                title: linkedTitle,
                content: linkedTitle,
                tags: extractTags(linkedTitle, linkedTitle),
                links: [],
                role: 'fact',
                created_at: now,
                updated_at: now
            };
            // Placeholder note for graph nodes that may not have explicit content yet.
            await upsertMemoryRecord(patientId, linkedNoteKey, JSON.stringify(linkedNotePayload));
        }
        return { noteId, links, title, tags };
    },
    async upsertRelation(patientId, fromNoteId, fromTitle, toTitle, incrementWeight = 1) {
        const relationKey = `${VAULT_RELATION_PREFIX}${fromNoteId}->${slugify(toTitle)}`;
        const now = new Date().toISOString();
        const { data } = await supabase_1.supabase
            .from('patient_memories')
            .select('*')
            .eq('patient_id', patientId)
            .eq('memory_key', relationKey)
            .maybeSingle();
        const existing = data ? parseVaultRelation(data) : null;
        const payload = {
            from_note_id: fromNoteId,
            from_title: fromTitle,
            to_title: normalizeWikiTitle(toTitle),
            weight: (existing?.weight ?? 0) + incrementWeight,
            created_at: existing?.created_at ?? now,
            last_seen_at: now
        };
        await upsertMemoryRecord(patientId, relationKey, JSON.stringify(payload));
    },
    async upsertMemory(patientId, key, value) {
        await upsertMemoryRecord(patientId, key, value);
        if (!isVaultMemoryKey(key)) {
            const vaultFactKey = `${VAULT_FACT_PREFIX}${key}`;
            try {
                await this.upsertVaultEntry(patientId, vaultFactKey, `${key}: ${value}`, 'fact');
                await this.upsertObsidianNote(patientId, {
                    noteId: slugify(key),
                    title: key.replace(/_/g, ' '),
                    content: `${key}: ${value}`,
                    role: 'fact'
                });
            }
            catch {
                // Semantic vault write should not block durable key-value memory saves.
            }
        }
    },
    async appendConversationNote(patientId, text, role) {
        const trimmed = text.trim();
        if (trimmed.length < 20)
            return;
        const key = `${VAULT_NOTE_PREFIX}${role}:${Date.now()}:${(0, crypto_1.randomUUID)().slice(0, 8)}`;
        try {
            const note = await this.upsertObsidianNote(patientId, {
                title: buildTitle(trimmed),
                content: trimmed,
                role
            });
            await this.upsertVaultEntry(patientId, key, `${note.title}\n${trimmed}`, role);
        }
        catch {
            // Best-effort semantic vault write.
        }
    },
    async semanticSearch(patientId, query, limit = 6) {
        const vaultMemories = await this.getVaultMemories(patientId);
        if (!vaultMemories.length)
            return [];
        let queryEmbedding = null;
        try {
            queryEmbedding = await this.createEmbedding(query);
        }
        catch {
            queryEmbedding = null;
        }
        const queryTerms = tokenizeForOverlap(query);
        const queryLinks = new Set(extractWikiLinks(query).map((item) => item.toLowerCase()));
        const relations = vaultMemories
            .map((memory) => parseVaultRelation(memory))
            .filter((item) => Boolean(item));
        const relationBoostByTitle = new Map();
        for (const relation of relations) {
            const key = relation.to_title.toLowerCase();
            relationBoostByTitle.set(key, (relationBoostByTitle.get(key) ?? 0) + Math.min(1, relation.weight / 3));
        }
        const scored = vaultMemories
            .map((memory) => {
            const payload = parseVaultDocument(memory);
            if (!payload?.content?.trim())
                return null;
            const semantic = payload.embedding?.length && queryEmbedding?.length
                ? Math.max(0, cosineSimilarity(queryEmbedding, payload.embedding))
                : 0;
            const recency = recencyScore(payload.updated_at ?? memory.updated_at);
            const tagOverlap = overlapScore(queryTerms, payload.tags);
            const titleTokens = tokenizeForOverlap(payload.title ?? '');
            const titleOverlap = overlapScore(queryTerms, Array.from(titleTokens));
            const linkDirectMatch = payload.title && queryLinks.has(payload.title.toLowerCase()) ? 1 : 0;
            const linkOutgoingMatch = payload.links?.some((link) => queryLinks.has(link.toLowerCase())) ? 1 : 0;
            const graphBoost = Math.max(relationBoostByTitle.get((payload.title ?? '').toLowerCase()) ?? 0, linkDirectMatch, linkOutgoingMatch ? 0.7 : 0);
            const roleBoost = payload.role === 'fact' ? 0.05 : payload.role === 'assistant' ? 0.02 : 0;
            const score = semantic * 0.58 + recency * 0.18 + tagOverlap * 0.12 + titleOverlap * 0.07 + graphBoost * 0.05 + roleBoost;
            const title = payload.title ? `${payload.title} :: ` : '';
            const tagLine = payload.tags?.length ? ` [tags: ${payload.tags.join(', ')}]` : '';
            return {
                key: memory.memory_key,
                content: `${title}${payload.content}${tagLine}`.trim(),
                score,
                reason: `semantic=${semantic.toFixed(2)} recency=${recency.toFixed(2)} graph=${graphBoost.toFixed(2)}`
            };
        })
            .filter((item) => item !== null)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        return scored;
    },
    async extractAndSaveMemories(patientId, companionReply) {
        const matches = Array.from(companionReply.matchAll(/\[MEMORY:([^=\]]+)=([^\]]+)\]/g));
        for (const match of matches)
            await this.upsertMemory(patientId, match[1].trim(), match[2].trim());
        return matches.length > 0;
    },
    stripControlTags(reply) {
        return reply.replace(/\[MEMORY:[^\]]+\]/g, '').replace(/\[ACTION:contact_family:[^\]]+\]/g, '').trim();
    },
    extractFamilyActionRequest(companionReply) {
        const match = /\[ACTION:contact_family:([^\]]+)\]/.exec(companionReply);
        return { hasAction: Boolean(match), message: match?.[1].trim() ?? null };
    }
};
//# sourceMappingURL=memory.service.js.map