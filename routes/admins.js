const express = require("express");
const router = express.Router();
const { Admin } = require("../models/Schemas");
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

router.get("/find/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    const { password, ...info } = admin._doc;
    res.status(200).json(info);
  } catch (err) {
    console.log(err.message);
    res.status(500).json(err);
  }
});

module.exports = router;
