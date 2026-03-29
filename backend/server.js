import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";


// Route Imports
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import parkingRoutes from "./routes/parking.js";
import bookingRoutes from "./routes/bookings.js";
import eventRoutes from "./routes/events.js";


dotenv.config();

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.log("⚠️  MONGODB_URI not found in .env. Database features will not work.");
}

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

// --- Routes ---
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/parking", parkingRoutes); // Base parking fetch
app.use("/api/owner", parkingRoutes);   // Owner specific parking/dashboard
app.use("/api/bookings", bookingRoutes);
app.use("/api/user", bookingRoutes);    // User specific bookings
app.use("/api", publicRoutes);          // Public info: waitlist, contact


// Health check
app.get("/", (req, res) => res.send("✅ Park Conscious Backend (Refactored) is live!"));

// --- Global Error Handling ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
