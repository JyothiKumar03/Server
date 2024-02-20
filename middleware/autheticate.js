const jwt = require("jsonwebtoken");
const Admin = require("../models/Schemas");
const User = require("../models/Schemas");
const dotenv = require("dotenv");
dotenv.config();

// Middleware function to authenticate admin
const authenticateAdmin = async function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const admin = await Admin.findById(decoded.admin.id);

    if (!admin) {
      throw new Error();
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware function to authenticate user
const authenticateUser = async function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.user.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};


module.exports = { authenticateAdmin, authenticateUser };
