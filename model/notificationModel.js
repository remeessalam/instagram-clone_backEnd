
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  posts: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
      posteduser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      time: String,
    },
  ],
});

const Notification = mongoose.model("notification", notificationSchema);

export default Notification;
