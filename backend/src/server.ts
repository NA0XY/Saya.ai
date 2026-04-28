import http from 'http';
import { env } from './config/env';
import { logger } from './config/logger';
import { app } from './app';
import { startScheduler } from './jobs/scheduler';
import { attachCompanionWebSocket } from './modules/companion/companion.websocket';

const server = http.createServer(app);
const companionWebSocket = attachCompanionWebSocket(server);

server.listen(env.PORT, () => {
  logger.info(`Saya.ai backend running on port ${env.PORT}`);
  startScheduler();
});

function shutdown(signal: string): void {
  logger.info('[SERVER] Shutdown requested', { signal });
  companionWebSocket.close();
  server.close(() => {
    logger.info('[SERVER] Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
