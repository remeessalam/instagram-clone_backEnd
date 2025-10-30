import express from "express";
import {
  getchat,
  addmessage,
  registerOnline,
} from "../controller/manageChat.js";
import verify from "../middleware/token.js";

const routes = express.Router();

routes.route("/getchat").post(verify, getchat);
routes.route("/addmessage").post(verify, addmessage);

export default routes;
