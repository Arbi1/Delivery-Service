/*  Google AUTH  */
let userProfile;
const User = require('../../models/User');
const { random } = require('../../config/db');
const shortid = require('shortid');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID =
  '310354761234-3k05u4g318q1dmrfpd2bhur6bfdm1l8f.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'pFdl4j2v609UFrgNJS0igzQe';
exports.googleProvider = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/v1/auth/google/callback',
  },
  async function(token, tokenSecret, profile, done) {
    console.log(profile);
    userProfile = await User.findOne({
      where: { googleId: profile.id },
    });
    console.log(`here ${userProfile}`);
    if (!userProfile) {
      userProfile = await User.create({
        firstName: profile._json.name,
        lastName: profile._json.given_name,
        email: profile._json.email,
        password: shortid.generate(),
        googleId: profile.id,
        role: 'SENDER',
      });
    }

    return done(null, userProfile);
  }
);

exports.useri = () => {
  return userProfile;
};
