const httpStatus = require('http-status');
const moment = require('moment-timezone');
const { omit } = require('lodash');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { jwtExpirationInterval } = require('../../config/vars');
const APIError = require('../errors/api-error');
const emailProvider = require('../services/emails/emailProvider');
const { SixDigitNumber } = require('../utils/common');

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.register = async (req, res, next) => {
  try {
    const userData = omit(req.body, 'role');
    const randomSixDigitNumber = SixDigitNumber();
    userData.verificationCode = randomSixDigitNumber;
    const user = await new User(userData).save();
    const userTransformed = user.transform();
    res.status(httpStatus.CREATED);
    // send email for verification
    userTransformed.verificationCode = randomSixDigitNumber;
    emailProvider.sendVerifyEmail(userTransformed);
    return res.json({
      success: true,
      message: 'User registration is complete. Please verify your emaill to proceed futher.',
      data: {},
    });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({
      success: true,
      message: 'User Logged In successfully.',
      data: {
        token,
        userTransformed,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const { email, refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = generateTokenResponse(user, accessToken);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

exports.sendPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user) {
      user.verificationCode = SixDigitNumber();
      await user.save();
      emailProvider.sendPasswordReset(user);
      res.status(httpStatus.OK);
      return res.json({
        success: true,
        message: 'Verification code has been sent successfully.',
        data: {},
      });
    }
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'No account found with that email',
    });
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, verificationCode } = req.body;
    const userInfo = await User.findOne({
      email,
    }).exec();

    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (!userInfo) {
      err.message = 'Invalid Email!';
      throw new APIError(err);
    }
    if (userInfo.verificationCode !== verificationCode) {
      err.message = 'Invalid Verification Code!';
      throw new APIError(err);
    }

    // update password
    userInfo.password = password;
    await userInfo.save();

    res.status(httpStatus.OK);
    return res.json({
      success: true,
      message: 'Password has been changed successfully.',
      data: {},
    });
  } catch (error) {
    return next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, verificationCode } = req.body;
    const userInfo = await User.findOne({
      email,
    }).exec();

    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    // check if email exist
    if (!userInfo) {
      err.message = 'Invalid Email!';
      throw new APIError(err);
    }
    // match verification code
    if (userInfo.verificationCode !== verificationCode) {
      err.message = 'Invalid Verification Code!';
      throw new APIError(err);
    }
    // store email verification date
    userInfo.emailVerifiedAt = new Date();
    await userInfo.save();
    res.status(httpStatus.OK);
    return res.json({
      success: true,
      message: 'Email verified successfully.',
      data: {},
    });
  } catch (error) {
    return next(error);
  }
};
