import { asyncwrappe } from "../middleware/asyncwrapper.js";
import postSchema from "../model/postModel.js";
import notificationSchema from "../model/notificationModel.js";
import userSchema from "../model/userModel.js";

const upload = asyncwrappe((req, res) => {
  postSchema
    .create({
      user: req.userId,
      image: req.body.finalImage,
      caption: req.body.caption,
    })
    .then((data) => {
      res.json({ msg: "post added in database" });
      const postes = data;
      userSchema.findById(data.user).then((data) => {
        const followers = data.followers;
        const noty = {
          post: postes._id,
          posteduser: req.userId,
          time: new Date(),
        };
        // notificationSchema
        //   .updateMany(
        //     { user: { $in: [...followers] } },
        //     { $push: { posts: { $each: [noty], $position: 0 } } }
        //   )
        //   .then(() => {});
      });
    });
});

const getPost = asyncwrappe((req, res) => {
  return new Promise((resolve, reject) => {
    postSchema
      .find()
      .sort({ createdAt: "-1" })
      .populate("user")
      .populate("comments.commentBy")
      .then((post) => {
        res.json({ status: true, post });
      });
  });
});

const getfriendpost = asyncwrappe((req, res) => {
  const user = req.body.id;
  return new Promise((resolve, reject) => {
    postSchema
      .find({ user })
      .sort({ createdAt: "-1" })
      .populate("user")
      .populate("comments.commentBy")
      .then((post) => {
        res.json({ status: true, post });
      });
  });
});

const userPost = asyncwrappe((req, res) => {
  return new Promise((resolve, reject) => {
    const user = req.userId;
    postSchema
      .find({ user })
      .sort({ createdAt: "-1" })
      .then((data) => {
        res.json({ status: true, data });
      });
  });
});

const Like = asyncwrappe((req, res) => {
  return new Promise(async (resolve, reject) => {
    let user = req.userId;
    let postId = req.body.postId;
    try {
      let likes = await postSchema.findOne({ _id: postId, Likes: user });

      if (likes) {
        let data = await postSchema.findByIdAndUpdate(postId, {
          $pull: { Likes: user },
        });
        res.json({ msg: "Unliked", count: data.Likes.length });
      } else {
        let data = await postSchema.findByIdAndUpdate(postId, {
          $push: { Likes: user },
        });
        res.json({ msg: "Liked", count: data.Likes.length });
      }
    } catch (err) {
      reject(err);
    }
  });
});

const addCommnent = asyncwrappe((req, res) => {
  return new Promise(async (resolve, reject) => {
    let userId = req.userId;
    let postId = req.body.postId;
    let text = req.body.text;
    try {
      let userCommnent = {
        comment: text,
        commentBy: userId,
        commentAt: new Date(),
      };
      let data = await postSchema.findByIdAndUpdate(postId, {
        $push: { comments: { $each: [userCommnent], $position: 0 } },
      });
      resolve({ msg: "comment added" });
      res.json({ status: true, resolve });
    } catch (err) {
      reject(err);
    }
  });
});

const popcomment = asyncwrappe((req, res) => {
  return new Promise((resolve, reject) => {
    try {
      const commentId = req.body.commentid;
      const postId = req.body.postid;
      postSchema
        .findByIdAndUpdate(postId, {
          $pull: { comments: { _id: commentId } },
        })
        .then((data) => {
          resolve({ msg: "comment removed" });
          res.json({ status: true, resolve });
        });
    } catch (err) {
      reject(err);
    }
  });
});

export {
  upload,
  getPost,
  getfriendpost,
  userPost,
  Like,
  addCommnent,
  popcomment,
};
