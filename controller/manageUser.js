import userSchema from "../model/userModel.js";
import { asyncwrappe } from "../middleware/asyncwrapper.js";

export const checkusername = asyncwrappe(async (req, res) => {
  const { username } = req.body;
  const checkusername = await userSchema.findOne({ username });
  res.status(201).json({ msg: checkusername ? "user" : "no-user" });
});

export const updateProfile = asyncwrappe(async (req, res) => {
  const { form, user } = req.body;
  const useid = user.userId;
  console.log(form.form);
  const use = await userSchema.findByIdAndUpdate(useid, {
    profileImage: form.form.profileImage,
    name: form.form.name,
    gender: form.form.gender,
    bio: form.form.bio,
    isPrivate: form.form.isPrivate,
  });
  res.json({ status: true, user: use });
});

export const getuser = asyncwrappe(async (req, res) => {
  const user = req.userId;
  const userdetails = await userSchema
    .findOne({ _id: user })
    .populate("followers")
    .populate("following");
  res.json({ status: true, user: userdetails });
});

export const getfriend = asyncwrappe(async (req, res) => {
  const user = req.body.id;
  const frienddetails = await userSchema
    .findOne({ _id: user })
    .populate("followers")
    .populate("following");
  res.json({ status: true, frienddetails });
});

export const users = asyncwrappe(async (req, res) => {
  const userid = req.userId;
  const user = await userSchema.findById(userid);
  try {
    const data = await userSchema
      .find({ _id: { $nin: [...user.following, userid] } }, { password: 0 })
      .sort({ createdAt: "-1" })
      .limit(5);
    res.json({ status: true, user: data });
  } catch (err) {
    throw err;
  }
});

export const follow = asyncwrappe(async (req, res) => {
  const frndId = req.body.frndid;
  const userid = req.userId;
  await userSchema.findByIdAndUpdate(userid, {
    $addToSet: { following: frndId },
  });
  const data = await userSchema.findByIdAndUpdate(frndId, {
    $addToSet: { followers: userid },
  });
  res.json({ status: true, resolve: data });
});

export const unfollow = asyncwrappe(async (req, res) => {
  const frndId = req.body.frndid;
  const userid = req.userId;
  await userSchema.findByIdAndUpdate(userid, { $pull: { following: frndId } });
  const data = await userSchema.findByIdAndUpdate(frndId, {
    $pull: { followers: userid },
  });
  res.json({ status: true, resolve: data });
});

export const finduser = asyncwrappe(async (req, res) => {
  const name = `(?i)${req.body.name}`;
  const result = await userSchema.find({ name: { $regex: name } });
  res.json({ result });
});

export const getfollowing = asyncwrappe(async (req, res) => {
  const userid = req.userId;
  const user = await userSchema.find({ _id: userid }).populate("following");
  res.json({ user });
});

export const addprofilepicture = asyncwrappe(async (req, res) => {
  const userid = req.userId;
  const image = req.body.image;
  await userSchema.findByIdAndUpdate(userid, { $set: { profileImage: image } });
  const data = await userSchema.findById(userid);
  res.json({ status: true, user: data });
});

export const setonline = asyncwrappe(async (req, res) => {
  const userid = req.userId;
  await userSchema.findByIdAndUpdate(userid, { isOnline: true });
  res.json({ status: true, message: "User is online", userId: userid });
});

export const setoffline = asyncwrappe(async (req, res) => {
  const userid = req.body.userId;
  const user = await userSchema.findByIdAndUpdate(
    userid,
    {
      isOnline: false,
      lastSeen: new Date(),
    },
    { new: true, select: "-password" }
  );
  console.log("setoffline user:", user);
  res.json({ status: true, message: "User is offline" });
});

export const registerOnline = asyncwrappe(async (req, res) => {
  console.log("user online", req.body);
  const userid = req.body.userId;
  const user = await userSchema.findByIdAndUpdate(
    userid,
    { isOnline: true },
    { new: true, select: "-password" }
  );
  res.json({ message: "user online registered", user });
});
