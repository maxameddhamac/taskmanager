import cloudinary from "../utilities/cloudinary.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "profile_pictures" },
        (error, uploadedFile) => {
          if (error) {
            reject(error);
          } else if (!uploadedFile) {
            reject(new Error("Cloudinary returned no upload result"));
          } else {
            resolve(uploadedFile);
          }
        },
      );
      uploadStream.end(req.file.buffer);
    });
    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};
