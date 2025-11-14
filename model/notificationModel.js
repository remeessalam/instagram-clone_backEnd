import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  posts: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
      posteduser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      time: String,
    },
  ],
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
