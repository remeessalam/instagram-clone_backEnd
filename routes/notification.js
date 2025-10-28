
import express from "express";
import { getnotification } from "../controller/manageNotification.js";
import verify from "../middleware/token.js";

const routes = express.Router();

routes.route("/getnotification").get(verify, getnotification);

export default routes;
