const router = require("express").Router();
const auth   = require("../middleware/auth");
const ctrl   = require("../controllers/stripeController");

// Webhook must be BEFORE auth (Stripe calls it, not your user)
// Raw body parsing is already set up in index.js for this path
router.post("/webhook", ctrl.webhook);

// Protected routes
router.post("/checkout",           auth, ctrl.createCheckout);
router.get("/success",             auth, ctrl.confirmSuccess);

module.exports = router;
