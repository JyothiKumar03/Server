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
    console.log("the request received -> ", req.admin);
    const exams = await Exam.find({ admin: req.admin });
    console.log("send to UI, exams -> ", exams);
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

//delete exam from DB

exports.deleteExam = async (req, res) => {
  try {
    const examId = req.params.id;
    console.log("exam del id", examId);
    // Check if the exam exists
    const exam = await Exam.findOne({ _id: examId });
    console.log("examid ", exam);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    console.log("admin in exam", exam.admin);
    // Check if the exam belongs to the authenticated admin
    if (exam.admin !== req.admin._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Delete the exam
    await exam.deleteOne();

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
