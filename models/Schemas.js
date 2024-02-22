const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    institutionName: { type: String, required: true }, // Common attribute for both users and admins
    role: { type: String, enum: ["User", "user"], default: "user" }, // Default role is user
    // Other attributes common to users
  },
  { timestamps: true }
);

// Admin Schema
const AdminSchema = new mongoose.Schema({
  // Additional attributes specific to admins
  adminname: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // collegeName: { type: String, required: true },
  institutionName: { type: String, required: true }, // Institution name for admins
  role: { type: String, enum: ["Admin", "admin"], default: "admin" }, // Role is admin
});
// Exam Schema
const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  timeDuration: { type: Number, required: true }, // Time duration in minutes
  googleFormLink: { type: String, required: true },
  postedForStudents: { type: Boolean, default: false }, // Boolean to indicate if exam is posted for students
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Reference to Admin document

  // Other properties related to the exam
});

// Attempt Schema
const AttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    score: { type: Number, default: 0 },
    malpracticeAttempts: { type: Number, default: 0 },
    // Other properties related to the attempt
  },
  { timestamps: true }
);

// Models
const User = mongoose.model("User", UserSchema);
//const Admin = User.model("Admin", AdminSchema);
const Admin = mongoose.model("Admin", AdminSchema);
const Exam = mongoose.model("Exam", ExamSchema);
const Attempt = mongoose.model("Attempt", AttemptSchema);

module.exports = { User, Admin, Exam, Attempt };
