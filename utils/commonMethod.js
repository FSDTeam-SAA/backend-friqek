import crypto from "crypto";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

// Generate a random numeric OTP
export const generateOTP = (length = 6) => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

export const isOtpExpired = (expiresAt) =>
  !expiresAt || expiresAt.getTime() < Date.now();

// Generate unique id, e.g used for medication/dose reference codes
export const generateUniqueId = (prefix = "SM") => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 6);
  const uniquePart = timestamp + randomPart;
  return `${prefix}${uniquePart.substring(0, 8)}`.toUpperCase();
};

export const hashPassword = async (newPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(newPassword, salt);
};

export const uniqueTransactionId = () => {
  return uuidv4().replace(/-/g, "").substr(0, 12).toUpperCase();
};

// returns YYYY-MM-DD key for "today" grouping (used for dose scheduling / adherence)
export const getTodayKey = (date = new Date()) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadOnCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...options },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};
