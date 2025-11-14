import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: Array,
    },
    Likes: {
      type: Array,
      default: [],
    },
    caption: {
      type: String,
    },
    comments: [
      {
        comment: {
          type: String,
        },
        commentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        commentAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
