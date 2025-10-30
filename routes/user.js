import express from "express";
import verify from "../middleware/token.js";
import { register, login, googleLogin } from "../controller/authentication.js";
import {
  checkusername,
  updateProfile,
  getuser,
  getfriend,
  users,
  follow,
  unfollow,
  finduser,
  getfollowing,
  addprofilepicture,
  setonline,
  setoffline,
} from "../controller/manageUser.js";

const routes = express.Router();

routes.route("/signup").post(register);
routes.route("/signup/checkusername").post(checkusername);
routes.route("/login").post(login);
routes.route("/google-login").post(googleLogin);
routes.route("/profile").post(verify, updateProfile);
routes.route("/getuser").post(verify, getuser);
routes.route("/getfriend").post(verify, getfriend);
routes.route("/users").get(verify, users);
routes.route("/follow").post(verify, follow);
routes.route("/unfollow").post(verify, unfollow);
routes.route("/finduser").post(verify, finduser);
routes.route("/getfollowing").get(verify, getfollowing);
routes.route("/setprofilepicture").post(verify, addprofilepicture);
routes.route("/setonline").post(verify, setonline);
routes.route("/setoffline").post(setoffline);

export default routes;
