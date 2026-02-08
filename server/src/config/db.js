const { default: chalk } = require('chalk');
const { MongoClient, ServerApiVersion } = require('mongodb');

/** MongoDB Connection URI */
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_NAME}.gv00ql5.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`;

/** Mongo Client */
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let collections = {}; // 🔑 all collections here

/** 🔗 Connect DB (only once) */
const connectDB = async () => {
  try {
    if (!db) {
      await client.connect();

      db = client.db(process.env.MONGO_DATABASE_NAME);

      /** 🧩 Register collections here */
      collections.rooms = db.collection('rooms');
      collections.users = db.collection('users');

      /** 🟢 Ping check */
      await client.db('admin').command({ ping: 1 });

      console.log(
        `\n🍃 ${chalk.green.bold('MongoDB')} Connected Successfully!`,
      );
      console.log(`🏷️ Cluster Host: ${chalk.yellow(client.options.srvHost)}`);
      console.log(
        `🕒 Connected At: ${chalk.cyan(new Date().toLocaleString())}\n`,
      );
    }

    return db;
  } catch (error) {
    console.error(
      chalk.red.bold(`❌ MongoDB Connection Failed: ${error.message || error}`),
    );
    process.exit(1);
  }
};

/** 🔑 Get DB instance */
const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

/** 📦 Get any collection safely */
const getCollection = (name) => {
  if (!collections[name]) {
    throw new Error(`Collection "${name}" is not registered`);
  }
  return collections[name];
};

module.exports = {
  connectDB,
  getDB,
  getCollection,
};
