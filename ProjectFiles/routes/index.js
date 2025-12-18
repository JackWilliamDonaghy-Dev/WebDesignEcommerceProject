var express = require('express');
var router = express.Router();

const session = require("express-session");

router.use(express.urlencoded({ extended: true }));

router.use(
  session({
    secret: "change-this-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Make login data available in all views
router.use((req, res, next) => {
  res.locals.loggedIn = !!req.session.loggedIn;
  res.locals.user = req.session.user || null;
  next();
});


// For JSON reading
const { readJsonArray } = require('./helper');


router.get('/', (req, res) => {
  const events = readJsonArray('data/events.json').slice(0, 3);
  const otherEvents = readJsonArray('data/events.json').slice(3, 6);
  res.render("pages/index", { title: 'Home', events, otherEvents, active: "index" });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About' });
});

router.get('/shop', (req, res) => {
  const products = readJsonArray('data/events.json');
  res.render("pages/shop", { products, active: "shop" });
});

router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

router.get('/checkout', (req, res) => {
  res.render('pages/checkout', { title: 'Checkout' });
});

router.get('/userdetails', (req, res) => {
  res.render('pages/userdetails', { title: 'User Details' });
});

router.get("/contact", (req, res) => {
  res.render("pages/contact", { title: "Contact", active: "contact", submitted: false });
});

//For Form Submission
router.post("/contact", (req, res) => {
  const { fullName, email, topic, message } = req.body;

  res.render("pages/contact", {
    title: "Contact",
    active: "contact",
    submitted: true,
    fullName,
    email,
    topic,
    message
  });
});

module.exports = router;
