import User from "../model/userModel.js";
import Follow from "../model/followModel.js";
import { asyncwrappe } from "../middleware/asyncwrapper.js";
import mongoose from "mongoose";

/**
 * Check if username exists
 */
export const checkusername = asyncwrappe(async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length === 0) {
    return res.status(400).json({
      status: false,
      message: "Username is required",
    });
  }

  const userExists = await User.findOne({
    username: username.toLowerCase().trim(),
  })
    .select("_id")
    .lean();

  res.status(200).json({
    status: true,
    exists: !!userExists,
    message: userExists ? "Username taken" : "Username available",
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncwrappe(async (req, res) => {
  const userId = req.userId; // From auth middleware
  const { profileImage, name, gender, biography, isPrivate } = req.body;

  // Validate input
  const updateData = {};
  if (profileImage) updateData.profileImage = profileImage;
  if (name) updateData.name = name;
  if (gender) updateData.gender = gender;
  if (biography !== undefined) updateData.biography = biography;
  if (typeof isPrivate === "boolean") updateData.isPrivate = isPrivate;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true, select: "-password" }
  ).lean();

  if (!updatedUser) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  res.json({
    status: true,
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

/**
 * Get current authenticated user with follow counts
 */
export const getuser = asyncwrappe(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  res.json({
    status: true,
    user,
  });
});

/**
 * Get another user's profile (friend/other user)
 */
export const getfriend = asyncwrappe(async (req, res) => {
  const { id } = req.body;
  const currentUserId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: false,
      message: "Invalid user ID",
    });
  }

  const friendDetails = await User.findById(id).select("-password").lean();

  if (!friendDetails) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  // Check if current user follows this friend
  const followRelation = await Follow.findOne({
    follower: currentUserId,
    following: id,
  }).lean();

  res.json({
    status: true,
    friendDetails: {
      ...friendDetails,
      isFollowing: !!followRelation,
    },
  });
});

/**
 * Get suggested users (users not followed by current user)
 */
export const users = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit) || 5;

  // Get users that current user is following
  const following = await Follow.find({ follower: userId })
    .select("following")
    .lean();

  const followingIds = following.map((f) => f.following);

  // Find users not in following list and not self
  const suggestedUsers = await User.find({
    _id: { $nin: [...followingIds, userId] },
  })
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    status: true,
    users: suggestedUsers,
  });
});

/**
 * Follow a user
 */
export const follow = asyncwrappe(async (req, res) => {
  const { frndid } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(frndid)) {
    return res.status(400).json({
      status: false,
      message: "Invalid user ID",
    });
  }

  if (userId === frndid) {
    return res.status(400).json({
      status: false,
      message: "Cannot follow yourself",
    });
  }

  // Check if user exists
  const targetUser = await User.findById(frndid).select("_id").lean();
  if (!targetUser) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  // Check if already following
  const existingFollow = await Follow.findOne({
    follower: userId,
    following: frndid,
  });

  if (existingFollow) {
    return res.status(400).json({
      status: false,
      message: "Already following this user",
    });
  }

  // Use session for atomic operation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create follow relationship
    await Follow.create(
      [
        {
          user: userId, // The relationship owner (for potential future use)
          follower: userId,
          following: frndid,
        },
      ],
      { session }
    );

    // Update counts
    await User.findByIdAndUpdate(
      userId,
      { $inc: { following_count: 1 } },
      { session }
    );

    await User.findByIdAndUpdate(
      frndid,
      { $inc: { followers_count: 1 } },
      { session }
    );

    await session.commitTransaction();

    res.json({
      status: true,
      message: "Successfully followed user",
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Unfollow a user
 */
export const unfollow = asyncwrappe(async (req, res) => {
  const { frndid } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(frndid)) {
    return res.status(400).json({
      status: false,
      message: "Invalid user ID",
    });
  }

  // Check if following
  const followRelation = await Follow.findOne({
    follower: userId,
    following: frndid,
  });

  if (!followRelation) {
    return res.status(400).json({
      status: false,
      message: "Not following this user",
    });
  }

  // Use session for atomic operation
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove follow relationship
    await Follow.deleteOne(
      {
        follower: userId,
        following: frndid,
      },
      { session }
    );

    // Update counts
    await User.findByIdAndUpdate(
      userId,
      { $inc: { following_count: -1 } },
      { session }
    );

    await User.findByIdAndUpdate(
      frndid,
      { $inc: { followers_count: -1 } },
      { session }
    );

    await session.commitTransaction();

    res.json({
      status: true,
      message: "Successfully unfollowed user",
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Search users by name or username
 */
export const finduser = asyncwrappe(async (req, res) => {
  const { query } = req.body;
  const limit = parseInt(req.query.limit) || 20;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      status: false,
      message: "Search query is required",
    });
  }

  const searchRegex = new RegExp(query.trim(), "i");

  const users = await User.find({
    $or: [
      { name: { $regex: searchRegex } },
      { username: { $regex: searchRegex } },
    ],
  })
    .select("-password")
    .limit(limit)
    .lean();

  res.json({
    status: true,
    users,
    count: users.length,
  });
});

/**
 * Get users that current user is following
 */
export const getfollowing = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;

  const following = await Follow.find({ follower: userId })
    .select("following")
    .populate({
      path: "following",
      select: "-password",
    })
    .limit(limit)
    .skip(skip)
    .lean();

  const followingUsers = following.map((f) => f.following).filter(Boolean);

  res.json({
    status: true,
    users: followingUsers,
    count: followingUsers.length,
  });
});

/**
 * Get user's followers
 */
export const getfollowers = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;

  const followers = await Follow.find({ following: userId })
    .select("follower")
    .populate({
      path: "follower",
      select: "-password",
    })
    .limit(limit)
    .skip(skip)
    .lean();

  const followerUsers = followers.map((f) => f.follower).filter(Boolean);

  res.json({
    status: true,
    users: followerUsers,
    count: followerUsers.length,
  });
});

/**
 * Update profile picture
 */
export const addprofilepicture = asyncwrappe(async (req, res) => {
  const userId = req.userId;
  const { image } = req.body;

  if (!image || !image.trim()) {
    return res.status(400).json({
      status: false,
      message: "Image URL is required",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { profileImage: image } },
    { new: true, select: "-password" }
  ).lean();

  res.json({
    status: true,
    message: "Profile picture updated",
    user: updatedUser,
  });
});

/**
 * Set user online status
 */
export const setonline = asyncwrappe(async (req, res) => {
  const userId = req.userId;

  await User.findByIdAndUpdate(userId, {
    isOnline: true,
    lastSeen: new Date(),
  });

  res.json({
    status: true,
    message: "User is online",
    userId,
  });
});

/**
 * Set user offline status
 */
export const setoffline = asyncwrappe(async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid user ID",
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isOnline: false,
      lastSeen: new Date(),
    },
    { new: true, select: "-password" }
  ).lean();

  res.json({
    status: true,
    message: "User is offline",
    user,
  });
});

/**
 * Register user as online (alternative method)
 */
export const registerOnline = asyncwrappe(async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid user ID",
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isOnline: true,
      lastSeen: new Date(),
    },
    { new: true, select: "-password" }
  ).lean();

  res.json({
    status: true,
    message: "User online registered",
    user,
  });
});
