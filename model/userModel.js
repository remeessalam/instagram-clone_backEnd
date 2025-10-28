import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      minlength: 2,
      maxlength: 50,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9._]+$/,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true, // ✅ makes it optional but still enforces uniqueness if provided
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true, // ✅ optional but unique if provided
      match: [/^[0-9]{10,15}$/, "Invalid mobile number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    profileImage: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    },
    coverImage: String,
    dateOfBirth: Date,
    bio: { type: String, maxlength: 200, default: "" },
    gender: {
      type: String,
      enum: ["Male", "Female", "Custom", "Prefer not to say"],
      default: "Prefer not to say",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    friendRequests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isVerified: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Virtual fields
userSchema.virtual("followersCount").get(function () {
  return this.followers?.length || 0;
});
userSchema.virtual("followingCount").get(function () {
  return this.following?.length || 0;
});

// Indexes
userSchema.index({ username: 1, email: 1 });

// ✅ Pre-save hook example
// userSchema.pre("save", async function (next) { ... });

const User = mongoose.model("user", userSchema);

export default User;
