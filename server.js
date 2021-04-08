const express = require('express');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error');
const colors = require('colors');
const cookieParser = require('cookie-parser');
//Used in creating sesions for oAuth
const session = require('express-session');
const passport = require('passport');
const { googleProvider } = require('./middleware/oAuth/googleOauth');
const { localProvider } = require('./middleware/oAuth/locaProvider');
const { JwtStrategy } = require('./middleware/oAuth/jwtStrategy');
const { cookieStrategy } = require('./middleware/oAuth/cookieStrategy');
const cookieSession = require('cookie-session');
var flash = require('connect-flash');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
// Use ejs template for login index
app.set('view engine', 'ejs');
//use flash

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['testkey'],
  })
);

app.use(flash());
//Use session for oauth
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET',
  })
);

//In / open the auth page
app.get('/', function(req, res) {
  res.render('pages/auth');
});

// Load passport

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id).then((user) => {
    done(null, user);
  });
});

// GOogle was here
passport.use(googleProvider);
passport.use(localProvider);
passport.use(JwtStrategy);
passport.use(cookieStrategy);

// Middlewares
// Cookie Parser
app.use(cookieParser());

// Json Body Parser
app.use(express.json());

//Load env vars
dotenv.config({ path: './config/config.env' });

//Load Routes
const auth = require('./routes/auth');
const filialis = require('./routes/admin/filalis');
const receiver = require('./routes/receivers');
const order = require('./routes/order');
const shipment = require('./routes/shipmentPackages');
const shippingEvent = require('./routes/shippingEvent')
// Mount Routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/receiver', receiver);
app.use('/api/v1/order', order);
app.use('/api/v1/shipment', shipment);
app.use('/api/v1/shippingevent', shippingEvent);
//Admin route
app.use('/api/v1/admin/filalis', filialis);

//Catch all unchatched errors
app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled rejection promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});
