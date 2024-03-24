const jwt = require("jsonwebtoken");
const { Admin } = require("../models/Schemas");
const { User } = require("../models/Schemas");
const dotenv = require("dotenv");
dotenv.config();

// Middleware function to authenticate admin
const authenticateAdmin = async function (req, res, next) {
  const token = req.header("x-auth-token");
  console.log(token);
  if (!token) {
    console.log("if triggered");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.Admin.id;

    const admin = await Admin.findById(id);
    console.log(admin);
    if (!admin) {
      console.log("error throwed");
      throw new Error();
    }
    console.log("successful authentication ", admin);
    req.admin = admin;
    next();
  } catch (error) {
    console.log("error -> ", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware function to authenticate user
const authenticateUser = async function (req, res, next) {
  const token = req.header("x-auth-token");
  // console.log('auth-token - ',token)
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id = decoded.user.id;
    const user = await User.findById(id);
    // console.log("authenticate user - ", user);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    console.log('authenticateUser successful')
    next();
  } catch (error) {
    console.log("not valid token");
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { authenticateAdmin, authenticateUser };
