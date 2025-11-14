import mongoose, { Schema } from "mongoose";

const FollowSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate follows
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model("Follow", FollowSchema);

export default Follow;
