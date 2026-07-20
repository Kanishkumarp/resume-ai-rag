const { mongoConnection } = require('./dist/repositories/mongo.js');

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

  console.log(JSON.stringify({ collectionName, count: docs.length, sample: docs.map((d) => ({ name: d.name, company: d.company, skills: d.skills })) }, null, 2));
  await mongoConnection.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
