import type http from 'http';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { TokenPayload } from '../auth/auth.types';
import { companionService } from './companion.service';
import type { Language } from '../../types/common';

interface CompanionSocketMessage {
  message: string;
  language?: Language;
}

function send(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

function parseToken(token: string | null): TokenPayload {
  if (!token) throw new Error('Missing token');
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

function parseMessage(raw: Buffer): CompanionSocketMessage {
  const parsed = JSON.parse(raw.toString()) as Partial<CompanionSocketMessage>;
  if (!parsed.message || typeof parsed.message !== 'string') throw new Error('message is required');
  if (parsed.language && parsed.language !== 'hi' && parsed.language !== 'en') throw new Error('language must be hi or en');
  return { message: parsed.message, language: parsed.language ?? 'hi' };
}

export function attachCompanionWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws/companion' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url ?? '', env.BACKEND_URL);
    const patientId = url.searchParams.get('patientId');

    let user: TokenPayload;
    try {
      user = parseToken(url.searchParams.get('token'));
      if (!patientId) throw new Error('Missing patientId');
    } catch (error) {
      const code = error instanceof TokenExpiredError ? 'TOKEN_EXPIRED' : error instanceof JsonWebTokenError ? 'INVALID_TOKEN' : 'BAD_WEBSOCKET_REQUEST';
      send(ws, { type: 'error', code, message: 'WebSocket authentication failed' });
      ws.close(1008, code);
      return;
    }

    send(ws, { type: 'ready', patient_id: patientId });

    ws.on('message', async (raw) => {
      try {
        const input = parseMessage(raw as Buffer);
        const response = await companionService.chat({ patient_id: patientId, message: input.message, language: input.language ?? 'hi' }, user.id);
        send(ws, { type: 'chat_response', data: response });
      } catch (error) {
        logger.error('[COMPANION_WS] Message handling failed', { patientId, userId: user.id, error: error instanceof Error ? error.message : String(error) });
        send(ws, { type: 'error', code: 'COMPANION_CHAT_FAILED', message: error instanceof Error ? error.message : 'Companion chat failed' });
      }
    });
  });

  logger.info('[COMPANION_WS] WebSocket server attached', { path: '/ws/companion' });
  return wss;
}
