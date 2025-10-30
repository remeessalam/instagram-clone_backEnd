// chatController.js

import { asyncwrappe } from "../middleware/asyncwrapper.js";
import chatSchema from "../model/chatModel.js";

export const getchat = asyncwrappe(async (req, res) => {
  let user = req.userId;
  let friendId = req.body.id;

  try {
    let chat = await chatSchema
      .findOne({ users: { $all: [friendId, user] } })
      .populate("users", "_id name image isOnline lastSeen");

    const chatdetail = chat
      ? chat
      : await (
          await chatSchema.create({ users: [friendId, user] })
        ).populate("users", "_id name image isOnline lastSeen");

    res.json({ chatdetail });
  } catch (err) {
    throw err;
  }
});

export const addmessage = asyncwrappe(async (req, res) => {
  let chat = req.body.chat;

  try {
    let message = await chatSchema.findByIdAndUpdate(chat.roomId, {
      $push: {
        messages: {
          $each: [chat],
          $position: 0,
        },
      },
    });

    res.json(message);
  } catch (err) {
    throw err;
  }
});
