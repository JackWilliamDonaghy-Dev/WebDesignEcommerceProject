var express = require('express');
var router = express.Router();

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

router.get('/contact', (req, res) => {
  res.render('pages/contact', { title: 'Contact' });
});

module.exports = router;
