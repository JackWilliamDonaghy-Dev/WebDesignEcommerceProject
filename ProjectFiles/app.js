var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//Session setup
var session = require("express-session");
app.use(session({
  secret: "change-this-secret",
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.loggedIn = !!req.session.loggedIn;
  res.locals.user = req.session.user || {};
  // make cart count available globally
    const cart = req.session.cart || [];
  res.locals.cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.js
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// helpers
hbs.registerHelper('eq', (a, b) => a === b);

// expose current section from path: "/", "/shop", "/about", etc.
app.use((req, res, next) => {
  // first segment or 'home'
  res.locals.active = (req.path.split('/')[1] || 'home').toLowerCase();
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

// ... error handlers
module.exports = app;


