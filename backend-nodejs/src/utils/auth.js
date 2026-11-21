const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const getPasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const createAccessToken = (data) => {
  const expiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) * 60; // Convert to seconds
  return jwt.sign(data, process.env.SECRET_KEY, {
    expiresIn,
    algorithm: process.env.ALGORITHM || 'HS256',
  });
};

const decodeAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return null;
  }
};

module.exports = {
  verifyPassword,
  getPasswordHash,
  createAccessToken,
  decodeAccessToken,
};
