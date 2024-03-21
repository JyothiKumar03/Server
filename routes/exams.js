const express = require("express");
const router = express.Router();
const {
  authenticateAdmin,
  authenticateUser,
} = require("../middleware/autheticate");
const {
  createQuestionForm,
  updateQuestionForm,
  getAllQuestionForms,
  getQuestionFormById,
  deleteQuestionForm,
  toggleFormStatus,
  getAttemptsForQuestionForm,
} = require("../controllers/AdminExamsRoutes");
const {
  getAllQuestionFormsForUser,
  getQuestionFormByIdForUser,
  submitQuestionFormAttempt,
  updateQuestionFormAttempt,
  getAllAttemptsForUser,
  getAttemptByIdForUser,
  startExam
  
} = require("../controllers/UserAttempts");

// Admin routes
router.post("/admin/questionforms",authenticateAdmin,  createQuestionForm);
router.put("/admin/questionforms/:id",authenticateAdmin, updateQuestionForm);
router.get("/admin/questionforms",authenticateAdmin, getAllQuestionForms);
router.get("/admin/questionforms/:id", authenticateAdmin, getQuestionFormById);
router.delete(
  "/admin/questionforms/:id",
  authenticateAdmin,
  deleteQuestionForm
);
router.post(
  "/admin/questionforms/:formId/toggle",
  authenticateAdmin,
  toggleFormStatus
);
router.get("/admin/attempts/:id",authenticateAdmin,getAttemptsForQuestionForm)

// User routes
router.get("/questionforms",authenticateUser,  getAllQuestionFormsForUser);
//to update the startExam
router.put("/:questionFormId/start",authenticateUser, startExam);

router.get("/questionforms/:id",  getQuestionFormByIdForUser);
router.post(
  "/questionforms/:questionFormId/attempts",
  authenticateUser,
  submitQuestionFormAttempt
);
router.put(
  "/questionforms/:formId/attempts/:attemptId",
  authenticateUser,
  updateQuestionFormAttempt
);
router.get(
  "/questionforms/:id/attempts",
  authenticateUser,
  getAllAttemptsForUser
);
router.get(
  "/questionforms/:questionFormId/attempts/:attemptId",
  authenticateUser,
  getAttemptByIdForUser
);

module.exports = router;
