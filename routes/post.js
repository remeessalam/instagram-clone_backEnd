
import express from 'express';
import {
  upload,
  getPost,
  userPost,
  getfriendpost,
  Like,
  addCommnent,
  popcomment
} from '../controller/managePost.js';
import verify from '../middleware/token.js';

const routes = express.Router();

routes.route('/uploadPost').post(verify, upload);
routes.route('/allpost').get(verify, getPost);
routes.route('/getpost').post(verify, userPost);
routes.route('/clicklike').post(verify, Like);
routes.route('/sendcomment').post(verify, addCommnent);
routes.route('/popcomment').post(verify, popcomment);
routes.route('/getfriendpost').post(verify, getfriendpost);

export default routes;
