require('dotenv').config();

const { default: chalk } = require('chalk');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // 1️⃣ Connect MongoDB
    const db = await connectDB();

    // 2️⃣ List collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Collections in DB:');
    collections.forEach((c) => console.log(' -', c.name));

    // 3️⃣ Start Express server
    app.listen(PORT, () => {
      console.log(
        chalk.magenta.bold(
          `🔥 Career Code Server is Running at http://localhost:${PORT}`,
        ),
      );
    });
  } catch (error) {
    console.error(chalk.red('❌ Failed to start server:'), error);
    process.exit(1);
  }
};
startServer();
