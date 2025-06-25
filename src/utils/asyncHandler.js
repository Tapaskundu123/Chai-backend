// 1)
// const asyncHandler=(fn)= async(req,res,next)=>{// higher order function -> function inside function
//   try{
//     await fn(req,res,next)
//   }
//    res.status(error.code || 500).json({
 //       success: false,
    //    message: error.message
  //  });
// }
// export default asyncHandler;

// 2)
 const asyncHandler=(requestHandler)=>{

   return (req,res,next)=>{ //it returns also as a function
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
 }
 export default asyncHandler;
