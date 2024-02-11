const { Exam } = require("../models/Schemas");

//Admin logic  for adding, deleting and updating exams.

// Create Exam
exports.createExam = async (req, res) => {
  try {
    const { title, timeDuration, googleFormLink } = req.body;
    const newExam = new Exam({
      title,
      timeDuration,
      googleFormLink,
      admin: req.admin.id,
    });
    const exam = await newExam.save();
    res.status(201).json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Exam
exports.updateExam = async (req, res) => {
  try {
    const { title, timeDuration, googleFormLink, postedForStudents } = req.body;
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { title, timeDuration, googleFormLink, postedForStudents },
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({ admin: req.admin.id });
    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Exam by ID
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
