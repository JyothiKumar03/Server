const { Attempt, QuestionForm } = require("../models/Schemas");

// Get All QuestionForms For User
exports.getAllQuestionFormsForUser = async (req, res) => {
  try {
    const questionForms = await QuestionForm.find({
      postedForStudents: true,
      //institution: userInstitution, // Filter questionForms by the user's institution
    })
      .populate({
        path: "createdBy",
        // match: { institution: institutionName }, // Further filter by the admin's institution
      })
      .exec();
    //console.log("admin in questionForm", questionForms.createdBy);

    // Remove questionForms where the admin's institution does not match the user's institution
    const filteredQuestionForms = questionForms.filter(
      (questionForm) => questionForm.createdBy !== null
    );
    console.log(questionForms);
    //console.log(filteredQuestionForms);
    res.json(filteredQuestionForms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getQuestionFormByIdForUser = async (req, res) => {
  try {
    console.log("route by id called");
    // const userInstitution = req.query;
    // console.log(userInstitution + "\n\n" + req.params.id);
    // const questionForm = await QuestionForm.findOne({
    //   _id: req.params.id,
    //   postedForStudents: true,
    //   //institution: userInstitution, // Filter the questionForm by the user's institution
    // })
      // .populate({
      //   path: "createdBy",
      //   // match: { institution: userInstitution }, // Further filter by the admin's institution
      // })
      // .exec();
    //console.log("admin in questionForm", questionForm.createdBy);
    const { formId } = req.params.id;
    console.log(formId)
    const questionForm = await QuestionForm.findById(req.params.id);
    console.log(questionForm);
    if (!questionForm || !questionForm.createdBy) {
      return res.status(404).json({ message: "QuestionForm not found" });
    }
    console.log(questionForm);
    res.json(questionForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Submit QuestionForm Attempt
exports.submitQuestionFormAttempt = async (req, res) => {
  try {
    const { malpracticeAttempts, answers } = req.body;
    console.log('reqbody',req.body);
    const formId = req.params.questionFormId; // Extract formId from params
    console.log('req-params : ',req.params)
    console.log('submit exam invoked');
  
    const form = await QuestionForm.findById(formId);
  
    // Ensure the form exists
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
  
    // Validate answers and calculate score
    let score = 0;
    answers.forEach((userAnswer, index) => {
      const question = form.questions[index];
      const correctAnswer = question.correctAnswer;
      const selectedOption = question.options[userAnswer]; // Obtain the selected option using the index
      console.log(`userAns - ${selectedOption} , correctAns - ${correctAnswer}`);
      if (selectedOption === correctAnswer) {
        score++;
      }
    });
    
  
    form.ansForms.push(answers);
    await form.save();
  
    // Create a new attempt with the calculated score
    const newAttempt = new Attempt({
      user: req.user.id,
      questionForm: formId,
      malpracticeAttempts,
      score,
    });
  
    // Save the attempt
    const attempt = await newAttempt.save();
  
    res.status(201).json(attempt);
  } catch (error) {
    console.error('error in submission - ', error);
    res.status(500).json({ message: "Server Error" });
  }  
};

// Update QuestionForm Attempt
exports.updateQuestionFormAttempt = async (req, res) => {
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


