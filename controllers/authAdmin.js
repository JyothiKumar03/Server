const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, User } = require("../models/Schemas");

exports.registerAdmin = async (req, res) => {
  try {
    console.log(req.body);
    const { adminname, email, password, institutionName } = req.body;
    let admin = await Admin.findOne({ email: email });
    if (admin) {
      return res.status(400).json({ message: "Admin already registered" });
    }
    admin = new Admin({ adminname, email, password, institutionName });
    //hash passowrd
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    //save  the admin to database
    await admin.save();
    return res
      .status(201)
      .json({ message: "Admin registered successfully!!", admin: admin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Server Error -> ${error.message}` });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //compare passwords
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    //create and sign token
    console.log("admin" - admin);
    const AdminPayload = {
      Admin: {
        id: admin.id,
        role: admin.role,
        email: admin.email,
        name: admin.adminname,
        institution: admin.institutionName,
      },
    };

    jwt.sign(
      AdminPayload,
      process.env.JWT_SECRET,
      { expiresIn: "5d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token: token, admin: AdminPayload.Admin });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Controller function to get users by institution for admin
exports.getUsersByInstitution = async (req, res) => {
  try {
    // Extract institution name from admin's request
    const { institutionName } = req.body;
    // Query users by institution name
    const users = await User.find({ institutionName });

    // Return users as response
    res.json({ users: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
