// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';
// import dotenv from "dotenv";
// dotenv.config(); 
// // Configure Cloudinary
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Upload local file to Cloudinary
// export const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     console.log("Uploaded to Cloudinary:", response.url);
//     return response;
//   } catch (error) {
//     fs.unlinkSync(localFilePath); // cleanup failed temp file
//     console.error("Cloudinary upload failed:", error);
//     return null;
//   }
// };

// // Example demo upload from URL (for test only)
//  cloudinary.uploader.upload(
//    "https://upload.wikimedia.org/wikipedia/commons/8/80/Olympic_flag.svg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     if (error) {
//       console.error("❌ Error uploading from URL:", error);
//     } else {
//       console.log("✅ Uploaded from URL:", result);
//     }
//   }
// );
// ;
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config(); 

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload local file to Cloudinary
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Uploaded to Cloudinary:", response.secure_url); // Use secure_url for proper access
    return response.secure_url; // Return only the URL for easy use
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // cleanup failed temp file
    }
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

// (Optional) Remove the example demo upload from URL to keep the