require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose  = require("mongoose");

const authRoutes   = require("./routes/auth");
const taskRoutes   = require("./routes/tasks");
const stripeRoutes = require("./routes/stripe");

const app = express();

app.use(helmet());

// Trust reverse proxy headers (needed on Render / Vercel edge)
app.set("trust proxy", 1);

// Build allowed-origins list from env + known defaults
const allowedOrigins = [
  process.env.CLIENT_URL,           // e.g. https://latest-one.vercel.app
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server calls (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Rate limiting — auth stricter than general API
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts — try again in 15 minutes" },
}));

app.use("/api", rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded" },
}));

// Stripe webhook needs raw body — MUST be before express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

// Health check (used by Render to verify the service is up)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    env:    process.env.NODE_ENV,
    mongo:  mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    ts:     new Date().toISOString(),
  });
});

app.use("/api/auth",   authRoutes);
app.use("/api/tasks",  taskRoutes);
app.use("/api/stripe", stripeRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ API listening on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
