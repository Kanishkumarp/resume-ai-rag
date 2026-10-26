const path = require('node:path');
const buildDirectory = path.resolve(__dirname, '..', '..', 'dist');
const { mongoConnection } = require(path.join(buildDirectory, 'repositories/mongo.js'));

(async () => {
  const db = await mongoConnection.connect();
  const collectionName = process.env.MONGODB_COLLECTION_NAME || 'resume';
  const collection = db.collection(collectionName);
  const docs = await collection.find({
    $or: [
      { skills: { $regex: 'python', $options: 'i' } },
      { text: { $regex: 'python', $options: 'i' } },
      { name: { $regex: 'python', $options: 'i' } },
      { company: { $regex: 'python', $options: 'i' } },
      { role: { $regex: 'python', $options: 'i' } },
    ],
  }).limit(5).toArray();

  console.log(JSON.stringify({ collectionName, count: docs.length }));
  await mongoConnection.close();
})().catch((err) => {
  console.error('Resume record diagnostic failed.');
  console.error(err instanceof Error ? err.name : 'UnknownError');
  process.exit(1);
});
