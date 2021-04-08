var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../../models/User');

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'fdasg07ga90g7aas7ds0ga';

exports.JwtStrategy = new JwtStrategy(opts, function(jwt_payload, done) {
  const user = User.findByPk(jwt_payload.id);

  if (user) {
    return done(null, user);
  } else {
    return done(null, false);
    // or you could create a new account
  }
});
