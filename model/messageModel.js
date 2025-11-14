import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  text: String,
  attachments: [{ url: String, mime: String }],
  type: { type: String, default: "text" },
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now, index: true },
});

messageSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
