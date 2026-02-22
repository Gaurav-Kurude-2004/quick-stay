import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB()

const app = express()
app.use(cors()) //Enable Cross-Original Resourse Sharing

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

const PORT= process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`http://localhost:${PORT}`));
