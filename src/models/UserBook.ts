import mongoose from "mongoose";

const UserBookSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    issueDate: {
      type: Date,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
      index: true,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "issued", "return_pending", "returned"],
      default: "pending",
      index: true,
    },

    fine: {
      type: Number,
      default: 0,
    },

    // 📧 EMAIL CONTROL FLAGS (IMPORTANT FIX)
    reminderSent: {
      type: Boolean,
      default: false,
    },

    overdueAlertSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.UserBook ||
  mongoose.model("UserBook", UserBookSchema);
