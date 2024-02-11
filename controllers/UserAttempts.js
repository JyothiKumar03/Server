const { Attempt } = require("../models/Schemas");

//User logic for the students

// Get All Exams For User
exports.getAllExamsForUser = async (req, res) => {
  try {
    const exams = await Exam.find({ postedForStudents: true });
    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Exam By ID For User
exports.getExamByIdForUser = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      postedForStudents: true,
    });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Submit Exam Attempt
exports.submitExamAttempt = async (req, res) => {
  try {
    const { score, malpracticeAttempts } = req.body;
    const newAttempt = new Attempt({
      user: req.user.id,
      exam: req.params.id,
      score,
      malpracticeAttempts,
    });
    const attempt = await newAttempt.save();
    res.status(201).json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Exam Attempt
exports.updateExamAttempt = async (req, res) => {
  try {
    const { score, malpracticeAttempts } = req.body;
    const attempt = await Attempt.findByIdAndUpdate(
      req.params.attemptId,
      { score, malpracticeAttempts },
      { new: true }
    );
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Attempts For User
exports.getAllAttemptsForUser = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id });
    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Attempt By ID For User
exports.getAttemptByIdForUser = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
