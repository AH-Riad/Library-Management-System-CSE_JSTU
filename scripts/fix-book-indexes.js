const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("books");

    // 🔥 DROP ALL INDEXES (fixes isbn_1 issue)
    await collection.dropIndexes();

    console.log("All indexes dropped successfully");

    // (optional safety) recreate clean indexes
    await collection.createIndex({ title: 1 });
    await collection.createIndex({ author: 1 });

    console.log("Basic indexes recreated");

    await mongoose.disconnect();
    console.log("Done");
  } catch (err) {
    console.error("ERROR:", err);
  }
}

run();
