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

    issueDate: Date,
    dueDate: Date,
    returnDate: Date,

    status: {
      type: String,
      enum: [
        "borrow_pending",
        "issued",
        "return_pending",
        "returned",
        "overdue",
      ],
      default: "borrow_pending",
    },

    fine: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.models.UserBook ||
  mongoose.model("UserBook", UserBookSchema);
