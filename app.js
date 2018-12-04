const express = require('express'),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-oauth20').Strategy,
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  config = require('./config/config'),
  app = express();


app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.facebook_callback_url
  },
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.use(new GoogleStrategy({
    clientID: config.google_api_key,
    clientSecret: config.google_api_secret,
    callbackURL: config.google_callback_url,
  },
  function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

app.get('/', function (req, res) {
  res.render('index', {
    user: req.user
  });
});

app.get('/login', function (req, res) {
  res.render('login')
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login')
}

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', {
    user: req.user
  });
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});


app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: 'email'
}));


app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/account',
    failureRedirect: '/login'
  }),
  function (req, res) {
    res.redirect('/');
  });

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/account',
    failureRedirect: '/login'
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
app.listen(3000);