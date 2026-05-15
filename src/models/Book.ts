import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    isbn: {
      type: String,
      unique: true,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    totalCopies: {
      type: Number,
      required: true,
      default: 1,
    },

    availableCopies: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Book || mongoose.model("Book", BookSchema);
