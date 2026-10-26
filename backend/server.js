// const express = require('express');
import  express from 'express';
import dotenv from "dotenv"
import  authRoute from  './routes/authroute.js';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import usersRoute from './routes/user.route.js';
import { v2 as cloudinary } from "cloudinary";
import postRoute from './routes/post.route.js';
import notificationRoute  from "./routes/notificationRoute.js";
import articleRoute from "./routes/article.route.js";
import cors from "cors"
import path from "path"

dotenv.config();
const __dirname = path.resolve();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const app = express();
const PORT = process.env.PORT || 5000; 


app.use(express.json({
  limit: '30mb'
}));
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true  // for parsing application/x-www-form-urlencoded
}))

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "https://knowverse-jiw0.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/staging
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use('/api/auth', authRoute);
app.use('/api/users',usersRoute);
app.use('/api/posts', postRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/articles',articleRoute)
if(process.env.NODE_ENV === "production")
{
 app.use(express.static(path.join(__dirname, "frontend", "dist")));
 app.use("*", (req, res) => {
   res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
 });

}


app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})
