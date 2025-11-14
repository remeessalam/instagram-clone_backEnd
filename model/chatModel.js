import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
    },
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1, updatedAt: -1 });

export default mongoose.model("Chat", chatSchema);
