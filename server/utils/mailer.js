const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password"
  }
});

const sendEnrollmentEmail = async (to, courseTitle) => {
  const mailOptions = {
    from: "your-email@gmail.com",
    to,
    subject: "Course Enrollment Confirmation",
    text: `You have been enrolled in the course: ${courseTitle}`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEnrollmentEmail };