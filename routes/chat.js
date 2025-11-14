import express from "express";
import {
  getchat,
  addmessage,
  markMessagesSeen,
  getMessages,
  getAllChats,
} from "../controller/manageChat.js";
import verify from "../middleware/token.js";

const routes = express.Router();

// Get or create a chat between users
routes.route("/getchat").post(verify, getchat);

// Add a new message to a chat
routes.route("/addmessage").post(verify, addmessage);

// Mark messages as seen in a chat
routes.route("/mark-seen").put(verify, markMessagesSeen);

// Get messages for a specific chat with pagination
routes.route("/messages/:chatId").get(verify, getMessages);

// Get all chats for the current user
routes.route("/all").get(verify, getAllChats);

export default routes;
