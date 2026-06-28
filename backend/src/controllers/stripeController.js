const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User   = require("../models/User");

const PRICE_MAP = {
  pro:   process.env.STRIPE_PRO_PRICE_ID,
  teams: process.env.STRIPE_TEAMS_PRICE_ID,
};


exports.createCheckout = async (req, res) => {
  try {
    const { plan = "pro" } = req.body;
    const priceId = PRICE_MAP[plan];

    if (!priceId)
      return res.status(422).json({ error: `Unknown plan: ${plan}` });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/pricing`,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("createCheckout:", err);
    res.status(500).json({ error: "Could not create checkout session" });
  }
};


exports.webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  
  switch (event.type) {
    case "checkout.session.completed": {
      const session  = event.data.object;
      const { userId, plan } = session.metadata;

      await User.findByIdAndUpdate(userId, {
        plan,
        stripeCustomerId: session.customer,
      });

      console.log(`✅ Upgraded user ${userId} to ${plan}`);
      break;
    }

    case "customer.subscription.deleted": {
      const sub    = event.data.object;
      const userId = sub.metadata?.userId;
      if (userId) {
        await User.findByIdAndUpdate(userId, { plan: "free" });
        console.log(`⬇️  Downgraded user ${userId} to free`);
      }
      break;
    }

    default:
      // Unhandled event — log and acknowledge
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  res.json({ received: true });
};


exports.confirmSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(422).json({ error: "session_id required" });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "subscription"],
    });

    res.json({
      status:      session.payment_status,
      plan:        session.metadata?.plan,
      customer:    session.customer_email,
      amount:      session.amount_total,
      currency:    session.currency,
      sessionId:   session.id,
    });
  } catch (err) {
    console.error("confirmSuccess:", err);
    res.status(500).json({ error: "Could not retrieve session" });
  }
};
