/**
 * local server entry file, for local development
 */
import app from './app.js';
import { DbStore } from './data/db.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3002;

async function bootstrap() {
  const db = DbStore.getInstance();
  await db.load();
  
  const server = app.listen(PORT, () => {
    console.log(`Server ready on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

bootstrap();