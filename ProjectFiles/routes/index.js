var express = require('express');
var router = express.Router();

// For JSON reading and writing
const { readJsonArray, writeJsonArray } = require('./helper');

//Cart functions/routes
function getCart(req){ if(!req.session.cart) req.session.cart=[]; return req.session.cart; }
function setFlash(req, key, val){ req.session[key] = val; }
function takeFlash(req, key){ const v = req.session[key]; req.session[key] = null; return v; }

router.post("/cart/add", (req, res) => {
  const { id, qty } = req.body;
  const quantity = Math.max(1, parseInt(qty, 10) || 1);

  const cart = getCart(req);
  const item = cart.find(i => i.id === id);
  if (item) item.qty += quantity; else cart.push({ id, qty: quantity });

  setFlash(req, "lastAddedId", id);
  res.redirect(req.get("Referrer") || "/shop");
});

router.post("/cart/update", (req, res) => {
  const { id, qty } = req.body;
  const quantity = Math.max(0, parseInt(qty, 10) || 0);

  const cart = getCart(req);
  const item = cart.find(i => i.id === id);
  if (item) item.qty = quantity;
  req.session.cart = cart.filter(i => i.qty > 0);

  res.redirect("/checkout");
});

router.post("/cart/clear", (req, res) => {
  req.session.cart = [];
  res.redirect("/checkout");
});

//Checkout Route
router.post("/checkout", (req, res) => {
  const events = readJsonArray("data/events.json");
  const orders = readJsonArray("data/orders.json");
  const cart = req.session.cart || [];

  const checkoutItems = cart.map(cartItem => {
    const event = events.find(e => e.id === cartItem.id);
    if (!event) return null;

    const price = Number(event.price) || 0;
    const quantity = cartItem.qty;
    const cost = price * quantity;

    return { id: event.id, title: event.title, price, quantity, cost };
  }).filter(Boolean);

  const totalCost = checkoutItems.reduce((sum, item) => sum + item.cost, 0);

  const cardName = String(req.body.cardname || "").toUpperCase();
  const cardNumber = String(req.body.cardNumber || "").replace(/\s+/g, "");

  const paymentIsValid =
    checkoutItems.length > 0 &&
    (totalCost === 0 || cardNumber.length >= 12) &&
    cardName.length >= 3;

  if (!paymentIsValid) {
    return res.render("pages/checkout", {
      title: "Checkout",
      active: "checkout",
      items: checkoutItems,
      total: totalCost,
      paymentFailure: true,
      meta:{ description:"Secure checkout for event tickets.", path:"/checkout", robots:"noindex,nofollow" }
    });
  }

  const newOrder = {
    orderId: "ord_" + Date.now(),
    createdAt: new Date().toISOString(),
    userId: req.session.loggedIn ? req.session.user.id : null,
    customer: {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      address1: req.body.address1,
      address2: req.body.address2 || "",
      address3: req.body.address3 || ""
    },
    items: checkoutItems,
    total: totalCost
  };

  orders.push(newOrder);
  writeJsonArray("data/orders.json", orders);

  req.session.cart = [];

  res.render("pages/checkout", {
    title: "Order Complete",
    active: "checkout",
    items: [],
    total: 0,
    paymentSuccess: true,
    meta:{ description:"Your order has been successfully completed.", path:"/checkout", robots:"noindex,nofollow" }
  });
});

router.get('/', (req, res) => {
  const events = readJsonArray('data/events.json').slice(0, 3);
  const otherEvents = readJsonArray('data/events.json').slice(3, 6);
  res.render("pages/index", {
    title: 'Home',
    events,
    otherEvents,
    active: "index",
    meta:{ description:"Discover upcoming events and nights. Book tickets easily for yourself or groups.", path:"/" }
  });
});

router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About',
    active: "about",
    meta:{ description:"Learn about our event ticket platform and how we support local gatherings.", path:"/about" }
  });
});

router.get("/shop", (req, res) => {
  const products = readJsonArray("data/events.json");
  const lastAddedId = takeFlash(req, "lastAddedId");
  res.render("pages/shop", {
    title: "Shop",
    products,
    active: "shop",
    lastAddedId,
    meta:{ description:"Shop event tickets. Add single or group tickets to your cart and checkout securely.", path:"/shop" }
  });
});

//Login Routes
router.get("/login", (req, res) => {
  const returnTo = req.query.returnTo || req.get("Referrer") || "/";
  res.render("pages/login", { title: "Login", returnTo, active: "login", meta:{ robots:"noindex,nofollow" } });
});

router.post("/login", (req, res) => {
  const { email, password, returnTo } = req.body;
  const users = readJsonArray("data/users.json");

  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
  if(!user) return res.status(401).render("pages/login", { title: "Login", active: "login", error: "The username or password you entered is incorrect.", returnTo: returnTo || "/", meta:{ robots:"noindex,nofollow" } });

  req.session.loggedIn = true;
  req.session.user = {
    id: user.id,
    email: user.email,
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    dob: user.dob || "",
    address1: user.address1 || "",
    address2: user.address2 || "",
    address3: user.address3 || ""
  };

  res.redirect(returnTo || "/");
});

router.get("/register", (req, res) => {
  const returnTo = req.query.returnTo || req.get("Referrer") || "/";
  res.render("pages/register", { title: "Register", active: "login", returnTo, meta:{ robots:"noindex,nofollow" } });
});

router.post("/register", (req, res) => {
  const { firstname, lastname, email, password, password2, returnTo } = req.body;
  const users = readJsonArray("data/users.json");

  if(password !== password2) return res.status(400).render("pages/register", { title: "Register", active: "login", error: "Passwords do not match.", returnTo: returnTo || "/", firstname, lastname, email, meta:{ robots:"noindex,nofollow" } });
  if(users.some(u => u.email.toLowerCase() === String(email).toLowerCase())) return res.status(400).render("pages/register", { title: "Register", active: "login", error: "Email already registered. Try logging in.", returnTo: returnTo || "/", firstname, lastname, meta:{ robots:"noindex,nofollow" } });

  const newUser = { id: "u_" + Date.now(), firstname, lastname, email, password };
  users.push(newUser);
  writeJsonArray("data/users.json", users);

  req.session.loggedIn = true;
  req.session.user = { id: newUser.id, email: newUser.email, firstname: newUser.firstname, lastname: newUser.lastname };
  res.redirect(returnTo || "/");
});

router.get("/logout", (req, res) => {
  const returnTo = req.get("Referrer") || "/";
  req.session.loggedIn = false;
  req.session.user = null;
  res.redirect(returnTo);
});

router.get("/checkout", (req, res) => {
  const products = readJsonArray("data/events.json");
  const cart = req.session.cart || [];

  const items = cart.map(ci => {
    const p = products.find(e => e.id === ci.id);
    if (!p) return null;
    const price = Number(p.price) || 0;
    return { id: p.id, title: p.title, price, qty: ci.qty, lineTotal: price * ci.qty };
  }).filter(Boolean);

  const total = items.reduce((sum, it) => sum + it.lineTotal, 0);

  res.render("pages/checkout", {
    title: "Checkout",
    active: "checkout",
    items,
    total,
    meta:{ description:"Secure checkout for event tickets.", path:"/checkout", robots:"noindex,nofollow" }
  });
});

//User Details Routes
router.get("/userdetails", (req, res) => {
  if (!req.session.loggedIn || !req.session.user?.id) return res.redirect("/login?returnTo=/userdetails");

  const users = readJsonArray("data/users.json");
  const userFromJson = users.find(u => u.id === req.session.user.id);

  if (userFromJson) {
    req.session.user = {
      ...req.session.user,
      firstname: userFromJson.firstname || "",
      lastname: userFromJson.lastname || "",
      dob: userFromJson.dob || "",
      address1: userFromJson.address1 || "",
      address2: userFromJson.address2 || "",
      address3: userFromJson.address3 || ""
    };
  }

  res.render("pages/userdetails", { title: "User Details", active: "userdetails", meta:{ robots:"noindex,nofollow" } });
});

router.post("/userdetails", (req, res) => {
  if (!req.session.loggedIn || !req.session.user?.id) return res.redirect("/login?returnTo=/userdetails");

  const { firstname, lastname, dob, address1, address2, address3 } = req.body;
  const users = readJsonArray("data/users.json");

  const idx = users.findIndex(u => u.id === req.session.user.id);
  if (idx === -1) return res.status(400).send("User not found.");

  users[idx] = { ...users[idx], firstname, lastname, dob, address1, address2, address3 };
  writeJsonArray("data/users.json", users);

  req.session.user = { ...req.session.user, firstname, lastname, dob, address1, address2, address3 };
  res.redirect("/userdetails");
});

router.get("/contact", (req, res) => {
  res.render("pages/contact", { title: "Contact", active: "contact", submitted: false, meta:{ robots:"noindex,nofollow" } });
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
    message,
    meta:{ robots:"noindex,nofollow" }
  });
});

module.exports = router;
