import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { APP_NAME } from '@online-uno/shared';

import { registerSocketHandlers } from './socket/index.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, app: APP_NAME, timestamp: new Date().toISOString() });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
  path: '/socket.io',
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`[server] ${APP_NAME} listening on http://localhost:${PORT}`);
});
