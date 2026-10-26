const dns = require('node:dns/promises');

const main = async () => {
  const configuredUri = process.env.MONGODB_URI;
  if (!configuredUri) {
    throw new Error('Set MONGODB_URI before checking MongoDB DNS.');
  }

  const uri = new URL(configuredUri);
  if (uri.protocol !== 'mongodb+srv:') {
    throw new Error('DNS SRV checks require a mongodb+srv:// connection string.');
  }

  const records = await dns.resolveSrv(`_mongodb._tcp.${uri.hostname}`);
  console.log(`MongoDB SRV lookup succeeded (${records.length} records).`);
};

main().catch((error) => {
  console.error('MongoDB SRV lookup failed.');
  console.error(error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});
