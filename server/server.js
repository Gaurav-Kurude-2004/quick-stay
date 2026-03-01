import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import cloudinary from "./configs/cloudinary.js";
import "./models/user.js";

connectDB()


const app = express()
app.use(cors()) //Enable Cross-Original Resourse Sharing
app.use(express.json())

//middleware
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);
app.use(clerkMiddleware())

// APIto listen to clerk webhooks
app.use("/api/clerk",clerkWebhooks);

app.get('/',(req,res)=> res.send("API is Working "))
app.use('/api/user',userRouter)
app.use('/api/hotels',hotelRouter)
app.use('/api/rooms',roomRouter)
app.use('/api/bookings',bookingRouter)

const PORT= process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`http://localhost:${PORT}`));
