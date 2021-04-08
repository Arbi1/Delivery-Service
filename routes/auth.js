const express = require('express');
const passport = require('passport');
const { useri } = require('../middleware/oAuth/googleOauth');

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require('../controllers/auth');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.put('/updatepassword', protect, updatePassword);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);

router.post('/loginlocal', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureMessage: 'error',
    failureFlash: true,
  })(req, res, next);
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/api/v1/auth/success');
  }
);

router.get('/success', (req, res) => res.send(useri()));
router.get('/error', (req, res) => res.send('error logging in'));

router.post(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  function(req, res) {
    console.log('test');
    res.send(req.user.profile);
  }
);

module.exports = router;
