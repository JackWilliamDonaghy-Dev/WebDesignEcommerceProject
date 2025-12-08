var express = require('express');
var router = express.Router();

/**
 * VERSION A — Simple static routing
 * Each route renders its matching .hbs file under /views/pages.
 * Your app.js middleware already sets res.locals.active so nav highlights correctly.
 */



router.get('/', (req, res) => {
  res.render('pages/index', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'About' });
});

router.get('/shop', (req, res) => {
  res.render('pages/shop', { title: 'Shop' });
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

module.exports = router;
