var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
const asyncHandler = require('../async');
const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorResponse');

exports.localProvider = new LocalStrategy(
  asyncHandler(async (username, password, done) => {
    if (!username || !password) {
      return done(null, false, { message: 'Please provide credentials' });
    }
    // check if user exists
    const user = await User.findOne({ where: { email: username } });

    if (!user) {
      return done(null, false, { message: 'Invalid email or password!' });
    }

    // check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password!' });
    }
    return done(null, user);
  })
);
