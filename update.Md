# NEW CHAT SCHEMA

import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
type: { type: String, enum: ["direct","group"], default: "direct" },
participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
lastMessage: {
text: String,
sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
createdAt: Date,
},
unreadCounts: { type: Map, of: Number, default: {} }
}, { timestamps: true });

chatSchema.index({ participants: 1, updatedAt: -1 });

export default mongoose.model("Chat", chatSchema);

# NEW MESSAGE SCHEMA

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
text: String,
attachments: [{ url: String, mime: String }],
type: { type: String, default: "text" },
seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
createdAt: { type: Date, default: Date.now, index: true }
});

messageSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
