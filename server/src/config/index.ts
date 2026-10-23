import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DB_PATH: process.env.DB_PATH || path.resolve(__dirname, '../../hasan_life.db'),
  UPLOADS_DIR: path.resolve(__dirname, '../../uploads/audio'),
  NODE_ENV: process.env.NODE_ENV || 'development'
};
