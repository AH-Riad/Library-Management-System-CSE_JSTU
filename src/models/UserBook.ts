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
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending", // borrow request
        "issued", // approved borrow
        "return_pending", // user requested return
        "returned", // completed
      ],
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
