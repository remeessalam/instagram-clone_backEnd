// chatController.js

import { asyncwrappe } from "../middleware/asyncwrapper.js";
import chatSchema from "../model/chatModel.js";
import messageSchema from "../model/messageModel.js";
import mongoose from "mongoose";

/**
 * Get or create a chat between users
 * @route POST /api/chat/get
 * @access Private
 */
export const getchat = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const { id: friendId } = req.body;
  console.log(friendId);
  // Validation
  if (!friendId) {
    return res.status(400).json({
      success: false,
      message: "Friend ID is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid friend ID",
    });
  }

  if (friendId === userId) {
    return res.status(400).json({
      success: false,
      message: "Cannot create chat with yourself",
    });
  }

  // Find existing chat or create new one
  let chat = await chatSchema
    .findOne({
      type: "direct",
      participants: { $all: [friendId, userId] },
    })
    .populate("participants", "_id name profileImage isOnline lastSeen")
    .populate("lastMessage.sender", "_id name profileImage")
    .lean();

  if (!chat) {
    // Create new chat
    chat = await chatSchema.create({
      type: "direct",
      participants: [friendId, userId],
      unreadCounts: {
        [userId]: 0,
        [friendId]: 0,
      },
    });

    // Populate the newly created chat
    chat = await chatSchema
      .findById(chat._id)
      .populate("participants", "_id name profileImage isOnline lastSeen")
      .lean();
  }

  res.status(200).json({
    success: true,
    chatdetail: chat,
  });
});

/**
 * Add a new message to a chat
 * @route POST /api/chat/message
 * @access Private
 */
export const addmessage = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const { chatId, text, attachments = [], type = "text" } = req.body;

  // Validation
  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: "Chat ID is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid chat ID",
    });
  }

  if (!text && (!attachments || attachments.length === 0)) {
    return res.status(400).json({
      success: false,
      message: "Message must contain text or attachments",
    });
  }

  // Verify chat exists and user is a participant
  const chat = await chatSchema.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: "Chat not found",
    });
  }

  if (!chat.participants.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: "You are not a participant in this chat",
    });
  }

  // Create the message
  const newMessage = await messageSchema.create({
    chatId,
    sender: userId,
    text: text?.trim(),
    attachments,
    type,
    seenBy: [userId],
  });

  // Populate sender information
  await newMessage.populate("sender", "_id name profileImage");

  // Update chat's lastMessage and unread counts
  const updateData = {
    lastMessage: {
      text: text?.trim() || "Attachment",
      sender: userId,
      createdAt: newMessage.createdAt,
    },
    updatedAt: new Date(),
  };

  // Increment unread count for all participants except sender
  const unreadUpdates = {};
  chat.participants.forEach((participantId) => {
    const participantIdStr = participantId.toString();
    if (participantIdStr !== userId.toString()) {
      const currentCount = chat.unreadCounts.get(participantIdStr) || 0;
      unreadUpdates[`unreadCounts.${participantIdStr}`] = currentCount + 1;
    }
  });

  await chatSchema.findByIdAndUpdate(
    chatId,
    {
      ...updateData,
      ...unreadUpdates,
    },
    { new: true }
  );

  res.status(201).json({
    success: true,
    message: newMessage,
  });
});

/**
 * Mark messages as seen
 * @route PUT /api/chat/mark-seen
 * @access Private
 */
export const markMessagesSeen = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const { chatId } = req.body;

  // Validation
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({
      success: false,
      message: "Valid chat ID is required",
    });
  }

  // Verify chat exists and user is a participant
  const chat = await chatSchema.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: "Chat not found",
    });
  }

  if (!chat.participants.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: "You are not a participant in this chat",
    });
  }

  // Mark all messages in this chat as seen by the user
  await messageSchema.updateMany(
    {
      chatId,
      sender: { $ne: userId },
      seenBy: { $ne: userId },
    },
    {
      $addToSet: { seenBy: userId },
    }
  );

  // Reset unread count for this user
  await chatSchema.findByIdAndUpdate(chatId, {
    [`unreadCounts.${userId}`]: 0,
  });

  res.status(200).json({
    success: true,
    message: "Messages marked as seen",
  });
});

/**
 * Get messages for a chat with pagination
 * @route GET /api/chat/messages/:chatId
 * @access Private
 */
export const getMessages = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Validation
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid chat ID",
    });
  }

  // Verify chat exists and user is a participant
  const chat = await chatSchema.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: "Chat not found",
    });
  }

  if (!chat.participants.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: "You are not a participant in this chat",
    });
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await messageSchema
    .find({ chatId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("sender", "_id name profileImage")
    .lean();

  const totalMessages = await messageSchema.countDocuments({ chatId });

  res.status(200).json({
    success: true,
    messages,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / parseInt(limit)),
      totalMessages,
      hasMore: skip + messages.length < totalMessages,
    },
  });
});

/**
 * Get all chats for a user
 * @route GET /api/chat/all
 * @access Private
 */
export const getAllChats = asyncwrappe(async (req, res) => {
  const userId = req.userId;

  const chats = await chatSchema
    .find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate("participants", "_id name profileImage isOnline lastSeen")
    .populate("lastMessage.sender", "_id name profileImage")
    .lean();

  res.status(200).json({
    success: true,
    chats,
  });
});
