const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

router.post("/", async (req, res) => {
  try {
    const { emails, link, body, subject } = req.body;

    let emailsString = "";

    emails.forEach((email, idx) => (emailsString += email + ", "));

    console.log(emailsString);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAILID,
        pass: process.env.EMAILPWD,
      },
    });

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "ProctorPal",
        link: `${process.env.CLIENT_URL}/app`,
      },
    });

    let emailConfig = {
      body: {
        name: subject,
        intro: body,
        action: {
          instructions: "To Answer the form, click here:",
          button: {
            bgColour: "rgb(99 102 241)", // Optional action button color
            text: "Go To Form",
            link,
          },
        },
        outro:
          "Want to create your own forms and share them easily? Visit our website!!",
      },
    };

    let email = MailGenerator.generate(emailConfig);

    let message = {
      from: `${process.env.EMAILID}`,
      to: emailsString,
      subject,
      html: email,
    };

    const info = await transporter.sendMail(message);

    console.log(info);

    return res.status(200).json({ message: "Email Sent Successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Something went wrong.", error: error.message });
  }
});

module.exports = router;
