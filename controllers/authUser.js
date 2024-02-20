const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/Schemas");

// Function to handle user registration
const registerUser = async (req, res) => {
  try {
    // Extract data from request body
    const { username, email, password, profilePic, institutionName } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user instance
    user = new User({ username, email, password, profilePic, institutionName });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server Error -> ${error.message}` });
  }
};

// Function to handle user login
const loginUser = async (req, res) => {
  try {
    console.log("route called");
    // Extract data from request body
    const email = req.body.email;
    const password = req.body.password;
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const UserPayload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    };

    jwt.sign(
      UserPayload,
      process.env.JWT_SECRET,
      { expiresIn: "5d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: UserPayload });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {registerUser, loginUser}
