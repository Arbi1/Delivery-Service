const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {

  if(!req.user) {
    throw new ErrorResponse('Not authenticated!');
  }
  else {
    next();
  }

  // let token;

  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith('Bearer')
  // ) {
  //   token = req.headers.authorization.split(' ')[1];
  // } else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // // Make sure token exists
  // if (!token) {
  //   return next(new ErrorResponse('Not authtorized to be here', 401));
  // }

  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //   console.log(decoded);

  //   req.user = await User.findByPk(decoded.id);
  //   console.log(req.user);
  //   next();
  // } catch (err) {
  //   return next(new ErrorResponse('Not authtorized to be here', 401));
  // }
});

// Grant access to specific roles

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `user role ${req.user.role} is not allowed to be here`,
          403
        )
      );
    }
    next();
  };
};

exports.passportProtect = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  next();
});