const { Attempt, QuestionForm ,User } = require("../models/Schemas");
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose');


// Get All QuestionForms For User
// Add a new endpoint to update the isStarted field
exports.startExam = async (req, res) => {
  try {
    const {id } = req.params;
    console.log('StartExam - questionFormId: ', req.params);
    // Update isStarted flag at the user level
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isStarted: true },
      { new: true }
    );
    // Check if the user has been updated successfully
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the updated user
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// Modify the getAllQuestionFormsForUser endpoint to fetch exams belonging to the user's institution
exports.getAllQuestionFormsForUser = async (req, res) => {
  try {
    console.log('USER', req.user)
    const userInstitution = req.user.institutionName; // Assuming user's institution is stored in req.user.institution

    const questionForms = await QuestionForm.find({
      postedForStudents: true,
      // institution: userInstitution, // Filter by the user's institution
    })
      .populate({
        path: "createdBy",
        match: { institution: userInstitution },
      })
      .exec();
      console.log('quesforms - ',questionForms)
    res.json(questionForms);
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
// exports.submitQuestionFormAttempt = async (req, res) => {
//   try {
//     const { malpracticeAttempts, answers } = req.body;
//     const formId = req.params.questionFormId;

//     // Find the form
//     const form = await QuestionForm.findById(formId);

//     // Ensure the form exists
//     if (!form) {
//       return res.status(404).json({ message: "Form not found" });
//     }
//     console.log('req from user body - ',req.body);
//     // Validate answers and calculate score
//     let score = 0;
//     const userAnswers = []; // Array to store user's answers for each question
//     const missingAnswers = []; // Array to store the indices of questions with missing answers
//     answers.forEach((userAnswer, index) => {
//       const question = form.questions[index];
//       const correctAnswer = question.correctAnswer;
//       const selectedOption = question.options[userAnswer]; // Obtain the selected option using the index
//       console.log(`userAns - ${selectedOption} , correctAns - ${correctAnswer}`);
//       if (selectedOption === correctAnswer) {
//         score++;
//       }
//       // Push the user's answer for this question into the userAnswers array
//       if (selectedOption !== undefined) {
//         userAnswers.push({
//           question: question._id,
//           answer: selectedOption,
//         });
//       } else {
//         missingAnswers.push(index); // Record the index of the question with a missing answer
//       }
//     });

//     // Check if any answers are missing
//     if (missingAnswers.length > 0) {
//       const missingQuestions = missingAnswers.map(index => ({
//         index,
//         question: form.questions[index]._id
//       }));
//       console.log(`Answer is missing for question(s) at index ${missingQuestions.map(q => q.index).join(', ')}`);
//     }

//     // Save the user's answers in the Attempt schema
//     form.ansForms.push(userAnswers);
//     await form.save();

//     // Create a new attempt with the calculated score and user's answers
//     const newAttempt = new Attempt({
//       user: req.user.id,
//       questionForm: formId,
//       malpracticeAttempts,
//       score,
//       answers: userAnswers, // Store the user's answers in the Attempt schema
//     });

//     // Save the attempt
//     const attempt = await newAttempt.save();

//     res.status(201).json(attempt);
//   } catch (error) {
//     console.error('error in submission - ', error);
//     res.status(500).json({ message: "Server Error" });
//   }  
// };

exports.submitQuestionFormAttempt = async (req, res) => {
  try {
    const { malpracticeAttempts, answers } = req.body;
    const formId = req.params.questionFormId;

    // Find the form
    const form = await QuestionForm.findById(formId);

    // Ensure the form exists
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Validate answers and calculate score
    let score = 0;
    const userAnswers = []; // Array to store user's answers for each question
    const missingAnswers = []; // Array to store the indices of questions with missing answers
    answers.forEach((userAnswer, index) => {
      const question = form.questions[index];
      const correctAnswer = question.correctAnswer;
      console.log(`userAns - ${userAnswer} , CorrectAns - ${correctAnswer}`)
      // Handle text-based answers
      if (typeof userAnswer === 'string') {
        // Assuming the userAnswer directly corresponds to the text provided by the user
        if (userAnswer === correctAnswer) {
          score++;
        }
        userAnswers.push({
          question: question._id,
          answer: userAnswer, // Store the user's text-based answer
          answerIdx: index
        });
      } else if (typeof userAnswer === 'number') {
        // Handle number-based answers
        const selectedOption = question.options[userAnswer]; // Obtain the selected option using the index
        if (selectedOption === correctAnswer) {
          score++;
        }
        // Push the user's answer for this question into the userAnswers array
        if (selectedOption !== undefined) {
          userAnswers.push({
            question: question._id,
            answer: selectedOption,
            answerIdx: index
          });
        } else {
          missingAnswers.push(index); // Record the index of the question with a missing answer
        }
      } else if (Array.isArray(userAnswer)) {
        // Handle array-based answers (multiple correct answers)
        let isAnswerCorrect = true;
        const stringAnswer = userAnswer.map(ans => question.options[ans]).join(', ');
        userAnswer.forEach(ans => {
          if (!correctAnswer.includes(question.options[ans])) {
            isAnswerCorrect = false;
          }
        });
        if (isAnswerCorrect) {
          score++;
        }
        userAnswers.push({
          question: question._id,
          answer: stringAnswer,
          answerIdx: index
        });
      } else {
        missingAnswers.push(index); // Record the index of the question with a missing answer
      }
    });

    // Check if any answers are missing
    if (missingAnswers.length > 0) {
      const missingQuestions = missingAnswers.map(index => ({
        index,
        question: form.questions[index]._id
      }));
      console.log(`Answer is missing for question(s) at index ${missingQuestions.map(q => q.index).join(', ')}`);
    }

    // Save the user's answers in the Attempt schema
    // form.ansForms.push(userAnswers);
    form.ansForms.push(answers);
    await form.save();

    // Create a new attempt with the calculated score and user's answers
    const newAttempt = new Attempt({
      user: req.user.id,
      questionForm: formId,
      malpracticeAttempts,
      score,
      answers: userAnswers, // Store the user's answers in the Attempt schema
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
    res.status(200).json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Attempts For User


// exports.getAllAttemptsForUser = async (req, res) => {
//   try {
//     const userId = ObjectId(req.params.id); // Assuming userId is passed in the request parameters
//     console.log('userId - ', req.params)
//     const attempts = await Attempt.aggregate([
//       {
//         $match: {
//           user: userId,
//           answers: { $exists: true, $ne: [] } // Match documents where answers array exists and is not empty
//         }
//       },
//       {
//         $lookup: {
//           from: 'questionforms', // Name of the collection to join with
//           localField: 'questionForm', // Field from the attempts collection
//           foreignField: '_id', // Field from the questionforms collection
//           as: 'questionFormDetails' // Name of the field to store the joined documents
//         }
//       },
//       {
//         $addFields: {
//           examTitle: { $arrayElemAt: ['$questionFormDetails.title', 0] } // Add a new field 'examTitle' containing the title of the question form
//         }
//       },
//       {
//         $project: {
//           user: 1,
//           examTitle: 1,
//           score: 1,
//           validated: 1,
//           malpracticeAttempts: 1
//         }
//       }
//     ]);
//     console.log('attempts res at server -', attempts)
//     res.status(200).json(attempts);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

exports.getAllAttemptsForUser = async (req, res) => {
  try {
    // Fetch all attempts made by the user
    const userId = req.params.id
    console.log('userId - ',req.params)
    const attempts = await Attempt.find({ user: userId }).populate('questionForm');
    // Extract necessary details from attempts
    console.log('attempts - ',attempts[0])
    const exams = attempts.map(attempt => {
      return {
        examTitle: attempt.questionForm.title,
        score: attempt.score,
        time: attempt.questionForm.timeDuration,
        questionFormId : attempt.questionForm.id,
        attemptId : attempt.id
      };
    });
    console.log('exams received - ',exams)
    res.status(200).json(exams);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: `Server Error , ${error.message}` });
  }
}



// Get Attempt By ID For User
// Get Attempt By ID For User with detailed report
exports.getAttemptByIdForUser = async (req, res) => {
  try {
    console.log('res by Id invoked')
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const questionForm = await QuestionForm.findById(attempt.questionForm)
      .populate('createdBy') 
      .exec();

    const detailedReport = {
      _id: attempt._id,
      score: attempt.score,
      questions: [],
    };

    console.log(attempt);
    for (const answer of attempt.answers) {
      console.log('for loop')
      const questionId = answer.question.toString(); ; // Extract question ID from the answer
      console.log(questionId)
      const question = questionForm.questions.find(q => q._id.toString() === questionId);
    
      // Check if question is null or undefined
      if (!question) {
        console.log(`Question not found for ID: ${questionId}`);
        continue; // Skip this answer if question not found
      } 
        console.log('question in forloop - ', question)
      console.log('question in forloop - ', question)
      const detailedQuestion = {
        question: question.question,
        attemptedAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
      };
    
      console.log('queslog', detailedQuestion);
      detailedReport.questions.push(detailedQuestion);
    }
    

    res.status(200).json({ form: questionForm, report: detailedReport });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};





// exports.getAttemptByIdForUser = async (req, res) => {
//   try {
//     const attempt = await Attempt.findById(req.params.attemptId);
//     if (!attempt) {
//       return res.status(404).json({ message: "Attempt not found" });
//     }
//     res.status(200).json(attempt);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


