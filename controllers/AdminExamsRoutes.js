const { QuestionForm, Admin ,Attempt } = require("../models/Schemas");
const shortid = require("shortid");

// Create QuestionForm
exports.createQuestionForm = async (req, res) => {
  try {
    const { title, description, timeDuration, questions } = req.body;
    const { _id } = req.admin; // Assuming req.admin contains the logged-in admin's details
    console.log('admin called - ', req.admin);
    const googleFormLink =  shortid.generate();
    console.log('create form route invoked', req.body);
    
    // Create a new QuestionForm document
    const newQuestionForm = new QuestionForm({
      title,
      description,
      timeDuration,
      googleFormLink,
      createdBy: _id,
      questions,
      ansForms : [],
    });
    
    // Save the new QuestionForm document
    const questionForm = await newQuestionForm.save();
    
    // Find the corresponding admin document and update the questionforms array
    const admin = await Admin.findById(_id);
    admin.questionforms.push(questionForm._id);
    await admin.save();
    
    res.status(201).json(questionForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Update QuestionForm
exports.updateQuestionForm = async (req, res) => {
  try {
    // Set postedForStudents to true by default
    const updatedFields = {
      postedForStudents: true, // Set to true by default
      googleFormLink :  `http://localhost:5173/ansForm/${req.params.id}`
    };

    const questionForm = await QuestionForm.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!questionForm) {
      return res.status(404).json({ message: "QuestionForm not found" });
    }

    res.status(200).json(questionForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Get All QuestionForms
exports.getAllQuestionForms = async (req, res) => {
  try {
    console.log(req.admin);
    const admin_forms = await Admin.findById(req.admin).populate('questionforms');
    console.log('all questions - ', admin_forms.questionforms)
    res.json(admin_forms.questionforms); // Note the lowercase 'questionforms'
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Get QuestionForm by ID
exports.getQuestionFormById = async (req, res) => {
  try {
    console.log('get id form route invoked - ',req.params.id);
    const questionForm = await QuestionForm.findById(req.params.id);
    if (!questionForm) {
      return res.status(404).json({ message: "QuestionForm not found" });
    }
    console.log('qs from server - ',questionForm);
    res.json(questionForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getAttemptsForQuestionForm = async (req, res) => {
  try {
      const questionFormId = req.params.id;
      console.log('formId-exams - ',req.params)
      // console.log('attempt shcema - ',Attempt);
      // Find all attempts for the given question form
      const attempts = await Attempt.find({ questionForm: questionFormId }).populate('user');
      console.log('attempts received - ',attempts);
      // Calculate total score and malpractices for each user
      const usersData = {};
      attempts.forEach(attempt => {
          const { user, score, malpracticeAttempts } = attempt;
          if (!usersData[user.id]) {
              usersData[user.id] = {
                  username: user.username,
                  email: user.email,
                  score: score,
                  totalMalpractices: malpracticeAttempts
              };
            }
          // } else {
          //     usersData[user._id].totalScore += score;
          //     usersData[user._id].totalMalpractices += malpracticeAttempts;
          // }
      });

      // Convert usersData object to array for easier manipulation
      const usersArray = Object.values(usersData);
      console.log('usersaRR - ',usersArray);
      res.json(usersArray);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete QuestionForm
exports.deleteQuestionForm = async (req, res) => {
  try {
    const questionFormId = req.params.id;
    const questionForm = await QuestionForm.findOne({ _id: questionFormId });
    if (!questionForm) {
      return res.status(404).json({ message: "QuestionForm not found" });
    }
    if (questionForm.createdBy.toString() !== req.admin.id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    await questionForm.deleteOne();
    res.status(200).json({ message: "QuestionForm deleted successfully" });
  } catch (error) {
    console.error("Error deleting questionForm:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle Form Status
exports.toggleFormStatus = async (req, res) => {
  try {
    const { formId } = req.params;
    const questionForm = await QuestionForm.findById(formId);
    if (!questionForm) {
      return res.status(404).json({ message: "QuestionForm not found" });
    }
    // Check if the user accessing this route is an admin
    if (questionForm.createdBy.toString() !== req.admin.id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    questionForm.accepting = !questionForm.accepting;
    await questionForm.save();
    return res
      .status(200)
      .json({ message: "Form status toggled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
