//method

import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'// 2
import { User } from '../models/user.model.js'; //3
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

// from part- 2

const generateAccessAndRefreshToken= async(userId)=>{
        
   try {
     const user= await User.findById(userId)

     const accessToken= user.generateAccessToken()
     const refreshToken= user.generateRefreshToken()

      user.refreshToken= refreshToken;

      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}

   } catch (error) {
      throw new ApiError(501, "Something went wrong while generating access and refresh token ")
   }
}
   // steps for register user-> part-1

    export const registerUser= asyncHandler(async(req,res)=>{

   //get user details from frontend
   // validation- not empty
   // check if user already exists: username, email
   // check for images, check for avatar
   // uload them to cloudinary, avatar
   //create user object- create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return res

   const {username, email, fullName, password} = req.body;
   // console.log("username: ", username);
   // console.log("email: ", email);
   // console.log("fullName: ", fullName);
   // console.log("password: ", password);
   console.log(req.body)

   if(username===''){
      throw new ApiError(400, "username is required");
   }
   if(email===''){
      throw new ApiError(400,"Email is required");
   }
   if(fullName===''){
      throw new ApiError(400, "fullName is required");
   }
   if(password===''){
      throw new ApiError(400,"password is required");
   }

   // 3  check if user already exists: username, email
   const existedUser= await User.findOne({
      
      $or:[{username},{email}]
   })
   const { avatar, coverImage }= req.files;

   const avatarFileLocalPath = req.files?.avatar[0]?.path;
   const coverFileLocalPath = req.files?.coverImage[0]?.path;

    console.log(req.files)

   if (!avatarFileLocalPath) {
    throw new ApiError(400, "avatar is required");
   }

   if (!coverFileLocalPath) {
    throw new ApiError(400, "avatar is required");
   }
   console.log(avatarFileLocalPath)
   console.log(coverFileLocalPath)

 
   if(existedUser){
    throw new ApiError(409,"User with username or email already exists ")
   }


   //upload on cloudinary


   const avatarLinkOnCloudinary= await uploadOnCloudinary(avatarFileLocalPath)
   const coverImageLinkOnCloudinary= await uploadOnCloudinary(coverFileLocalPath)     
    
   if(!avatarLinkOnCloudinary || !coverImageLinkOnCloudinary ){
      console.log("not uploaded on cloudinary")
   }

   // save in mongoDB database
  const userStoredDB = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    fullName,
    avatar: avatarLinkOnCloudinary, // ✅ Cloudinary URL
    coverImage: coverImageLinkOnCloudinary, // ✅ Cloudinary URL
  });

   // console.log(user)

    res.status(200).json(
       new ApiResponse(200, userStoredDB,"user registered successfully")   
  )

 
})

  //login User data part-2
    export const loginUser= asyncHandler(async(req,res)=>{
   // steps
   // req.body-> collect data (server) by post request
   // username or email
   // find the user
   // password check
   // access and refresh token
   // send cookie


   const {username, password, email}= req.body;
   
  // 2) username or email if any available or not
 if(!(username || email)){
      throw new ApiError(400,"username or email is required")
   }

   // 3) if the username or email given by user is available in database or not 
   const checkUserInDB= await User.findOne({
      $or: [{username},{email}]
   })
   
   // if not then user not exists
   if(!checkUserInDB){
      throw new ApiError(400,"User doesn't exists")
   }
   
   // password check

   const isPasswordValid= await checkUserInDB.isPasswordCorrect(password);

   if(!isPasswordValid){
      throw new ApiError(401,"invalid user crediantials")
   }
   

   const {accessToken, refreshToken}= await generateAccessAndRefreshToken(checkUserInDB._id)

   const loggedInUser= await User.findById(checkUserInDB._id).select("-password -refreshToken")

   const options={

      HttpOnly: true,
      secure: true
   }

   return res.status(200)
             .cookie("accessToken",accessToken,options)
             .cookie("refreshToken",refreshToken,options)
             .json(
               new ApiResponse(
                  200,
                  {
                     user: loggedInUser,accessToken,
                     refreshToken
                  },
                  "User logged in successfully"
               )
             ) 
       })

    export const loggedOutUser= asyncHandler(async(req,res)=>{
      
       await User.findByIdAndUpdate(

         req.user._id,
         {
             $set:{
               refreshToken:undefined
             }
         },
         {
            new: true
         }
       )
       const options= {
         HttpOnly: true,
         secure: true
       }

       return res
       .status(200)
       .clearCookie("accessToken", options)
       .clearCookie("refreshToken",options)
       .json(new ApiResponse(200,{},"User logged out"))

  })    
    
    export const refreshAccessToken= asyncHandler(async(req,res)=>{

      const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

      if(incomingRefreshToken){
         throw new ApiError(401, "Unauthorized request")
      }

    try{  
      const decodedToken= jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )

      const user= await User.findById(decodedToken?.id)

      if(!user){
         throw new ApiError(401,"Invalid refresh token")
      }

      if(incomingRefreshToken!== user?.refreshToken){
         throw new ApiError(401,"Refresh Token is expired or used")
      }

      const options={
         httpOnly: true,
         secure: true
      }

     const {accessToken, newRefreshToken}= await generateAccessAndRefreshToken(user._id)

      return res
      .status(200)
      .cookie("accessToken",ac)
      .cookie("newRefreshToken")
      .json(
         new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access Token refreshed" 
         )
 )
}
catch(error){
   throw new ApiError(401, error?.message ||
      "Invalid refresh token"
   )
}
    })

export default registerUser;