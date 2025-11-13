// backend/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import chalk from "chalk";

import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

/* ----------------------------------------
   🧩 SECURITY & CORE MIDDLEWARES
---------------------------------------- */

// Secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ----------------------------------------
   🌍 CORS CONFIGURATION (Auto-allows localhost ports)
---------------------------------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5177",
  "http://127.0.0.1:5177",

  "http://localhost:5174",
  "http://127.0.0.1:5174",

  "http://localhost:5175",
  "http://127.0.0.1:5175",

  "http://localhost:5176",
  "http://127.0.0.1:5176",

  "http://localhost:5178",
  "http://127.0.0.1:5178",

  "http://localhost:3000",

  // ⭐ ADD YOUR VERCEL FRONTEND HERE
  "https://food-donation-platform-frontend.vercel.app",

  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
];



app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman, same-origin, or localhost
      if (!origin) return callback(null, true);

      // ✅ Auto-allow all localhost ports (for dev)
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        console.log(`✅ CORS allowed (localhost dev): ${origin}`);
        return callback(null, true);
      }

      // ✅ Check against whitelist
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed for: ${origin}`);
        return callback(null, true);
      }

      console.warn(`🚫 CORS blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight requests (Express 5 fix)
app.options(/.*/, cors());

/* ----------------------------------------
   🧹 SANITIZATION & SECURITY
---------------------------------------- */
app.use(express.json({ limit: "10kb" }));
app.use(xss());
app.use(mongoSanitize());

// Handle invalid JSON gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  next();
});

/* ----------------------------------------
   🚦 RATE LIMITING
---------------------------------------- */
const limiter =
  process.env.NODE_ENV === "production"
    ? rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200,
        message: "Too many requests, please try again later.",
      })
    : rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 1000, // generous for localhost
        message: "Too many requests (dev mode). Slow down!",
      });

app.use(limiter);

/* ----------------------------------------
   🧾 REQUEST LOGGER (MORGAN + CHALK)
---------------------------------------- */
morgan.token("statusColor", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  if (status >= 200) return chalk.green(status);
  return chalk.white(status);
});

morgan.token("methodColor", (req) => {
  const colors = {
    GET: chalk.cyan,
    POST: chalk.green,
    PUT: chalk.yellow,
    PATCH: chalk.magenta,
    DELETE: chalk.red,
  };
  return (colors[req.method] || chalk.white)(req.method);
});

app.use(
  morgan(
    (tokens, req, res) =>
      [
        chalk.gray(tokens.date(req, res, "iso")),
        tokens.methodColor(req, res),
        chalk.white(tokens.url(req, res)),
        tokens.statusColor(req, res),
        chalk.gray(`${tokens["response-time"](req, res)} ms`),
      ].join(" ")
  )
);

/* ----------------------------------------
   📦 ROUTES
---------------------------------------- */
app.use("/api/users", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", testRoutes);

/* ----------------------------------------
   🩺 HEALTH CHECK
---------------------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🍽️ Food Donation API is running smoothly",
    environment: process.env.NODE_ENV || "development",
  });
});

/* ----------------------------------------
   ⚠️ GLOBAL ERROR HANDLER
---------------------------------------- */
app.use(errorHandler);

/* ----------------------------------------
   🚀 SERVER START
---------------------------------------- */
const PORT = process.env.PORT || 5961;
const server = app.listen(PORT, () => {
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

/* ----------------------------------------
   🛑 GRACEFUL SHUTDOWN
---------------------------------------- */
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});
