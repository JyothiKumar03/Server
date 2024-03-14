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
  adminname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  institutionName: { type: String, required: true },
  role: { type: String, enum: ["Admin", "admin"], default: "admin" },
  questionforms: [
    { type: mongoose.Schema.Types.ObjectId, ref: "QuestionForm" },
  ],
});

const QuestionFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  timeDuration: { type: String, required: true }, // Time duration in minutes
  googleFormLink: { type: String, required: true }, // Link to the form for students
  postedForStudents: { type: Boolean, default: false }, // Indicates whether the form has been posted to students or not
  created: {type: Date,required: true,default: Date.now,},
  accepting: {type: Boolean,required: true,default: true,},
  questions: [
    {
      question: { type: String, required: true },
      type:{type: String, required:true},
      options: [{ type: String }], // Array of options for multiple choice questions
      correctAnswer: { type: String }, // Correct answer for the question
      required : {type: Boolean}
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  }, // Reference to the admin who created the form
  ansForms: [[{}]],
});

const AttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the student user
  questionForm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionForm",
    required: true,
  }, // Reference to the associated QuestionForm
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionForm.questions",
      }, // Reference to the question in the QuestionForm
      answer: { type: String, required: true },
    },
  ],
  validated: { type: Boolean, default: false }, // Indicates whether the attempt has been validated against correct answers or not
  malpracticeAttempts: { type: Number, default: 0 }, // Total number of malpractices
});

// // Exam Schema
// const ExamSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   timeDuration: { type: Number, required: true }, // Time duration in minutes
//   googleFormLink: { type: String, required: true },
//   postedForStudents: { type: Boolean, default: false }, // Boolean to indicate if exam is posted for students
//   admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Reference to Admin document

//   // Other properties related to the exam
// });

// // Attempt Schema
// const AttemptSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
//     score: { type: Number, default: 0 },
//     malpracticeAttempts: { type: Number, default: 0 },
//     // Other properties related to the attempt
//   },
//   { timestamps: true }
// );

// Models
const User = mongoose.model("User", UserSchema);
//const Admin = User.model("Admin", AdminSchema);
const Admin = mongoose.model("Admin", AdminSchema);
//const Exam = mongoose.model("Exam", ExamSchema);
const QuestionForm = mongoose.model("QuestionForm", QuestionFormSchema);
const Attempt = mongoose.model("Attempt", AttemptSchema);

module.exports = { User, Admin, QuestionForm, Attempt };
