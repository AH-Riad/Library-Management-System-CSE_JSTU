import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    availableCopies: {
      type: Number,
      default: 1,
      min: 0,
    },

    // ✅ SAFE OPTIONAL FIELD (no crash, no index issues)
    isbn: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Book || mongoose.model("Book", BookSchema);
