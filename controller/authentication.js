import userSchema from "../model/userModel.js";
import notificationSchema from "../model/notificationModel.js";
import bcrypt from "bcrypt";
import createToken from "../middleware/jwt.js";
import { asyncwrappe } from "../middleware/asyncwrapper.js";

// Helper function to find a user by email, mobile, or username
const findUser = async (identifier) => {
  let query;
  if (/^\d+$/.test(identifier)) {
    query = userSchema.findOne({ mobile: identifier });
  } else if (/\S+@\S+\.\S+/.test(identifier)) {
    query = userSchema.findOne({ email: identifier });
  } else {
    query = userSchema.findOne({ username: identifier });
  }
  return query.select("+password");
};

// Helper function to create a notification for a user if it doesn't exist
const createNotification = async (userId) => {
  const existingNotification = await notificationSchema.findOne({
    user: userId,
  });
  if (!existingNotification) {
    await notificationSchema.create({ user: userId });
  }
};

export const register = asyncwrappe(async (req, res) => {
  const { fullName, email, phone, password, userName } = req.body;

  const existingUser = await findUser(email || phone);
  if (existingUser) {
    return res.status(409).json({
      status: false,
      message:
        "Sorry, this email or mobile number already exists. Try something different.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userSchema.create({
    name: fullName,
    email: /\S+@\S+\.\S+/.test(email) ? email : undefined,
    mobile: /^\d+$/.test(email) ? email : undefined,
    password: hashedPassword,
    username: userName,
  });

  await createNotification(newUser._id);

  const token = createToken({ userId: newUser._id });

  res.status(201).json({
    status: true,
    user: newUser,
    token,
  });
});

export const login = asyncwrappe(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUser(email);
  console.log(user);
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "Incorrect email/username. Please double-check.",
    });
  }

  if (!user.password) {
    return res.status(400).json({
      status: false,
      message:
        "This account seems to be created using a social login. Please use the appropriate login method.",
    });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      status: false,
      message: "Incorrect password. Please double-check.",
    });
  }

  await createNotification(user._id);

  const token = createToken({ userId: user._id });

  res.status(200).json({
    status: true,
    user,
    token,
  });
});

// NOTE: This is not a secure way to handle Google OAuth.
// The backend should receive the Google token and verify it with Google's servers.
// This implementation trusts the client to send correct information, which is a security risk.
export const googleLogin = asyncwrappe(async (req, res) => {
  const { email, name, picture, email_verified } = req.body;

  if (!email_verified) {
    return res.status(400).json({
      status: false,
      message: "Google account not verified.",
    });
  }

  let user = await userSchema.findOne({ email });

  if (!user) {
    user = await userSchema.create({
      name,
      email,
      username: email.split("@")[0], // Creating a username from email
      image: picture,
    });
  }

  await createNotification(user._id);

  const token = createToken({ userId: user._id });

  res.status(200).json({
    status: true,
    user,
    token,
  });
});
