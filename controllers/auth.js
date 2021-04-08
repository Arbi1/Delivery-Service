const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const { Op } = require('sequelize');

// @desc     Register
// @route    Post /api/v1/auth/register
// @access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    address,
    phone,
    email,
    password,
    FilialiId,
  } = req.body;

  // create user
  const user = await User.create({
    firstName,
    lastName,
    address,
    phone,
    email,
    password,
    role: 'SENDER',
    FilialiId,
  });

  // create token
  req.login(user, function(err) {
    if (err) {
      return next(
        new ErrorResponse('Something happen during the session creation', 400)
      );
    }
    return res.json({ success: true, message: 'The session is created' });
  });
});

// @desc     Login
// @route    Post /api/v1/auth/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide credintals', 400));
  }
  // check if user exists
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new ErrorResponse('Invailid credientials', 404));
  }

  // check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invailid credintals', 400));
  }
  // create token
  req.login(user, function(err) {
    if (err) {
      return next(
        new ErrorResponse('Something happen during the session creation', 400)
      );
    }
    return res.json({ success: true, message: 'The session is created' });
  });
});

// @desc     Get current logged in user
// @route    Post /api/v1/auth/me
// @access   private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc     Update user Details
// @route    Post /api/v1/auth/updatedetails
// @access   private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.adress,
  };

  const user = await User.findByPk(req.user.id);
  await user.update(fieldsToUpdate);
  res.status(200).json({ success: true, data: user });
});

// @desc     Update password
// @route    Put /api/v1/auth/updatepassword
// @access   private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);

  // check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('The password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();
  req.login(user, function(err) {
    if (err) {
      return next(
        new ErrorResponse('Something happen during the session creation', 400)
      );
    }
    return res.json({ success: true, message: 'The session is created' });
  });
});

// @desc     Forgot password
// @route    Post /api/v1/auth/forgotpassword
// @access   public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  //get reset tijeb
  const resetToken = user.getResetPasswordToken();
  await user.save();
  // create reset url
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `you're receiving this email for reseting your password \n\n ${resetURL}`;
  try {
    console.log(message);
    await sendEmail({
      email: user.email,
      subject: 'Password reset password token',
      message,
    });

    res.status(200).json({ success: true, data: 'email is send' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();
    return next(
      new ErrorResponse('An error happen during the email send', 404)
    );
  }
});

// @desc    Reset Password
// @route    Put /api/v1/auth/resetpassword/:resettoket
// @access   private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  console.log(resetPasswordToken);
  const user = await User.findOne({
    where: {
      [Op.and]: [
        { resetPasswordToken },
        { resetpasswordExpire: { [Op.gt]: Date.now() } },
      ],
    },
  });
  if (!user) {
    return next(new ErrorResponse('invailid token', 400));
  }

  //Set the new password
  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetpasswordExpire = null;
  await user.save();
  // create token
  req.login(user, function(err) {
    if (err) {
      return next(
        new ErrorResponse('Something happen during the session creation', 400)
      );
    }
    return res.json({ success: true, message: 'The session is created' });
  });
});

// @desc    Logout current logged in user
// @route    Get /api/v1/auth/logout
// @access   private
exports.logout = asyncHandler(async (req, res, next) => {
  // await res.cookie('express:sess', 'none', {
  //   expires: new Date(Date.now()),
  //   httpOnly: true,
  // });

  // await res.cookie('express:sess.sig', 'none', {
  //   expires: new Date(Date.now()),
  //   httpOnly: true,
  // });
  req.logout();
  res.status(200).json({
    success: true,
    data: {},
  });
});

// Method to get token from model, create cookie and send the response
sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};

//module.exports = sendTokenResponse
