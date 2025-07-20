import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'warehouse-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  },
});

const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "warehouse-products",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

const uploadProductImage = multer({ storage: productImageStorage });


// 3. Create Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // optional: limit 2MB
  },
});

const uploadSingle = (fieldName) => {
  console.log(fieldName);
  
  return (req, res, next) => {
    const uploader = upload.single(fieldName);
    uploader(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(500).json({ message: `Upload error: ${err.message}` });
      }
      next();
    });
  };
};

// 5. Delete image (Cloudinary)
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};


export { upload, uploadSingle, cloudinary, deleteImage, uploadProductImage };
