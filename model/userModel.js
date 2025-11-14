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
    profileImage: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    },
    biography: { type: String, maxlength: 200, default: "" },
    isPrivate: { type: Boolean, default: false },
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

    date_of_birth: Date,
    gender: {
      type: String,
      enum: ["Male", "Female", "Custom", "Prefer not to say"],
      default: "Prefer not to say",
    },
    followers_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ username: 1, email: 1 });

// ✅ Pre-save hook example
// userSchema.pre("save", async function (next) { ... });

const User = mongoose.model("user", userSchema);

export default User;
