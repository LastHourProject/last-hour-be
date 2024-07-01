const Email = require('email-templates');
const nodemailer = require('nodemailer');
const { emailConfig } = require('../../../config/vars');

// SMTP is the main transport in Nodemailer for delivering messages.
// SMTP is also the protocol used between almost all email hosts, so its truly universal.
// if you dont want to use SMTP you can create your own transport here
// such as an email service API or nodemailer-sendgrid-transport

const transporter = nodemailer.createTransport({
  port: emailConfig.port,
  host: emailConfig.host,
  auth: {
    user: emailConfig.username,
    pass: emailConfig.password,
  },
  secure: false, // upgrades later with STARTTLS -- change this based on the PORT
});

// verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.log('error with email connection');
  }
});

exports.sendVerifyEmail = async (user) => {
  const email = new Email({
    views: { root: __dirname },
    message: {
      from: emailConfig.from,
    },
    // uncomment below to send emails in development/test env:
    send: true,
    preview: false,
    transport: transporter,
  });

  email
    .send({
      template: 'verifyEmail',
      message: {
        to: user.email,
      },
      locals: {
        code: user.verificationCode,
      },
    })
    .catch((error) => console.log('error sending verification email => ', error));
};

exports.sendPasswordReset = async (user) => {
  const email = new Email({
    views: { root: __dirname },
    message: {
      from: emailConfig.from,
    },
    // uncomment below to send emails in development/test env:
    send: true,
    preview: false,
    transport: transporter,
  });

  email
    .send({
      template: 'passwordReset',
      message: {
        to: user.email,
      },
      locals: {
        // passwordResetUrl should be a URL to your app that displays a view where they
        // can enter a new password along with passing the resetToken in the params
        code: user.verificationCode,
      },
    })
    .catch(() => console.log('error sending password reset email'));
};

exports.sendPasswordChangeEmail = async (user) => {
  const email = new Email({
    views: { root: __dirname },
    message: {
      from: 'support@your-app.com',
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: transporter,
  });

  email
    .send({
      template: 'passwordChange',
      message: {
        to: user.email,
      },
      locals: {
        productName: 'Test App',
        name: user.name,
      },
    })
    .catch(() => console.log('error sending change password email'));
};
