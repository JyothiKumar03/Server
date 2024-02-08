const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getUsersByInstitution,
} = require("../controllers/authAdmin");

// User registration route
router.post("/register", registerAdmin);
// User login route
router.post("/login", loginAdmin);

router.get("/getSameclgUsers", getUsersByInstitution);

module.exports = router;
