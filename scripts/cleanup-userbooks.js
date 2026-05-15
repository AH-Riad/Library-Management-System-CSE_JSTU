require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Simple schema (no strict check so it won't break)
const UserBook = mongoose.model(
  "UserBook",
  new mongoose.Schema({}, { strict: false }),
);

async function cleanup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const all = await UserBook.find({});

    const seen = new Set();
    const duplicates = [];

    for (const doc of all) {
      const key = doc.userId + "_" + doc.bookId;

      if (seen.has(key)) {
        duplicates.push(doc._id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length === 0) {
      console.log("✅ No duplicates found");
    } else {
      const result = await UserBook.deleteMany({
        _id: { $in: duplicates },
      });

      console.log("🧹 Deleted duplicates:", result.deletedCount);
    }

    await mongoose.disconnect();
    console.log("✅ Cleanup done");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

cleanup();
