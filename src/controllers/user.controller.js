//method

import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'// 2
import { User } from '../models/user.model.js'; //3
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'
const registerUser= asyncHandler(async(req,res)=>{

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
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    fullName,
    avatar: avatarLinkOnCloudinary, // ✅ Cloudinary URL
    coverImage: coverImageLinkOnCloudinary, // ✅ Cloudinary URL
  });

   console.log(user)

    res.status(200).json(
       new ApiResponse(200, user,"user registered successfully")
    
  )

})
export default registerUser;