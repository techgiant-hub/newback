//require(`dotenv`).config({path:`./env`});
//import dotenv from "dotenv";
//import mongoose from "mongoose";


import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";

console.log("MONGODB_URI =", process.env.MONGODB_URI);

connectDB()

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