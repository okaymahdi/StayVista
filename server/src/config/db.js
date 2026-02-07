const { default: chalk } = require('chalk');
const { MongoClient, ServerApiVersion } = require('mongodb');

/** MongoDB Connection URI */
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_NAME}.gv00ql5.mongodb.net/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`;

/** Mongo Client Setup */
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db; // 🔑 store DB instance globally

/** Database Connection Function */
const connectDB = async () => {
  try {
    /** 🔗 Connect only once */
    if (!db) {
      await client.connect(); // connect once

      db = client.db(process.env.MONGO_DATABASE_NAME);

      /** 🟢 Optional ping  */
      await client.db('admin').command({ ping: 1 });

      /** ✅ Successful Connection Logs */
      console.log(
        `\n🍃 ${chalk.green.bold('MongoDB')} Connected Successfully!`,
      );
      console.log(`🏷️ Cluster Host: ${chalk.yellow(client.options.srvHost)}`);
      console.log(
        `🕒 Connected At: ${chalk.cyan(new Date().toLocaleString())}\n`,
      );
    }

    return db; // 🔑 important
  } catch (error) {
    // ❌ Connection Failed Logs
    console.error(
      chalk.red.bold(`❌ MongoDB Connection Failed: ${error.message || error}`),
    );
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
};

module.exports = { connectDB, getDB };
