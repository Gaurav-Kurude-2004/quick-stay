import express from "express";
import "dotenv/config";
import cors from "cors";

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import { clerkMiddleware } from "@clerk/express";

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

import "./models/user.js";

// connect services
connectDB();
connectCloudinary();

const app = express();

app.use(cors({
  origin: [
      "https://hotel-booking-eta-lovat.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true
}));

/* WEBHOOK ROUTES (MUST BE BEFORE express.json()) */

app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

/* MIDDLEWARE */

app.use(express.json());
app.use(clerkMiddleware());

/* TEST ROUTE */

app.get("/", (req, res) => {
  res.send("API is Working 🚀");
});

/* API ROUTES */

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

/* SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
