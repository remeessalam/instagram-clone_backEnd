import { asyncwrappe } from "../middleware/asyncwrapper.js";
import Notification from "../model/notificationModel.js";

export const getnotification = asyncwrappe((req, res) => {
  let user = req.userId;
  return new Promise((resolve, reject) => {
    Notification.findOne({ user })
      .populate("posts.posteduser")
      .populate("posts.post")
      .sort()
      .then((data) => {
        res.json({ data });
      });
  });
});
