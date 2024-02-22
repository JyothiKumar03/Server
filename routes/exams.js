const express = require("express");
const router = express.Router();
const {
  authenticateAdmin,
  authenticateUser,
} = require("../middleware/autheticate");
const {
  createExam,
  updateExam,
  getAllExams,
  getExamById,
  deleteExam,
} = require("../controllers/AdminExamsRoutes");
const {
  getAllExamsForUser,
  getExamByIdForUser,
  submitExamAttempt,
  updateExamAttempt,
  getAllAttemptsForUser,
  getAttemptByIdForUser,
} = require("../controllers/UserAttempts");

// Admin routes
router.post("/admin/exams", authenticateAdmin, createExam);
router.put("/admin/exams/:id", authenticateAdmin, updateExam);
router.get("/admin/exams", authenticateAdmin, getAllExams);
router.get("/admin/exams/:id", authenticateAdmin, getExamById);
router.delete("/admin/exams/:id", authenticateAdmin, deleteExam);

// User routes
router.get("/exams", authenticateUser, getAllExamsForUser);
router.get("/exams/:id", authenticateUser, getExamByIdForUser);
router.post("/exams/:id/attempts", authenticateUser, submitExamAttempt);
router.put(
  "/exams/:examId/attempts/:attemptId",
  authenticateUser,
  updateExamAttempt
);
router.get("/exams/:id/attempts", authenticateUser, getAllAttemptsForUser);
router.get(
  "/exams/:examId/attempts/:attemptId",
  authenticateUser,
  getAttemptByIdForUser
);

module.exports = router;
