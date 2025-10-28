
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    messages: [
      {
        roomId: String,
        author: String,
        text: String,
        time: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
