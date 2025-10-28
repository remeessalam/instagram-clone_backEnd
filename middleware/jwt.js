
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const signJwt = function (payload) {
  return jwt.sign(payload, process.env.SECRET_TOKEN);
};

// const maxAge = 60 * 60 * 24;

export default signJwt;
