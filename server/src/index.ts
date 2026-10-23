import { getDatabase } from './db/connection.js';
import { createApp } from './app.js';
import { CONFIG } from './config/index.js';

const db = getDatabase();
const app = createApp(db);

const server = app.listen(CONFIG.PORT, () => {
  console.log('====================================================');
  console.log(`🤖 Hasan Life Guide Backend is running!`);
  console.log(`📡 URL: http://localhost:${CONFIG.PORT}`);
  console.log(`🗄️  SQLite Database: ${CONFIG.DB_PATH}`);
  console.log(`🎙️  Audio Memos: ${CONFIG.UPLOADS_DIR}`);
  console.log(`🌐 Health Check: http://localhost:${CONFIG.PORT}/api/health`);
  console.log('====================================================');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
