require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_COLLECTION_NAME;

if (!uri || !dbName || !collectionName) {
  throw new Error('Set MONGODB_URI, MONGODB_DB_NAME, and MONGODB_COLLECTION_NAME in your .env file.');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  family: 4,
  retryWrites: false,
  tls: uri.startsWith('mongodb+srv://'),
});

let cachedCollection = null;

async function connectDB() {
  if (cachedCollection) {
    return cachedCollection;
  }

  await client.connect();
  await client.db('admin').command({ ping: 1 });
  const db = client.db(dbName);
  cachedCollection = db.collection(collectionName);
  return cachedCollection;
}

module.exports = { connectDB, client };
