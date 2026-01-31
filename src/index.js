//require(`dotenv`).config({path:`./env`});
//import dotenv from "dotenv";
//import mongoose from "mongoose";


 /*
import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";

console.log("MONGODB_URI =", process.env.MONGODB_URI);
const app = express();

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 5000,()=>{
    console.log(`server is running at port: ${process.env.PORT}`);
  })
})
.catch((err)=>{
  console.log("mongo db connection failed",err);
})
*/













 // function connectDB(){}  -->this is also a way
  //connectDB()


/*
1)one method of connecting database 

import express from "express"
const app=express()
(async()=>{
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("error",error);
        throw error
      })
      app.listen(process.env.PORT,()=>{
        console.log(`app is listening on port ${process.env.PORT}`);
      })
    } catch (error) {
        console.error("ERROR",error)
        throw err
        
    }
})()
    */


import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import userRouter from "./routes/user.routes.js";

dotenv.config(); // load env variables
const app = express();
const PORT = process.env.PORT || 5000;

// 1️⃣ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2️⃣ Routes
app.use("/api/v1/users", userRouter);

// 3️⃣ Health check
app.get("/", (req, res) => res.send("API is running"));

// 4️⃣ Connect DB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });





















/*

import express from "express";
import connectDB from "./db/index.js";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("MONGODB_URI =", process.env.MONGODB_URI);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed ❌", err);
  });

*/

