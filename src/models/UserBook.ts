import mongoose from "mongoose";

const UserBookSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "issued", "return_requested", "returned", "overdue"],
      default: "pending",
    },

    fine: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.UserBook ||
  mongoose.model("UserBook", UserBookSchema);
