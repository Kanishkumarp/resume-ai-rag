import { createApp } from './app';
import { env } from './config/environment';
import { mongoConnection } from './repositories/mongo';

const app = createApp();
const port = Number(process.env.PORT || env.port || 3000);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

void mongoConnection.connect()
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error: unknown) => {
    console.error('❌ MongoDB connection failed');
    console.error(JSON.stringify({
      errorType: error instanceof Error ? error.name : 'UnknownError',
    }));
  });
