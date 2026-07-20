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
  .catch((err) => {
    console.error('❌ MongoDB connection failed');
    console.error(err);
  });
