const multer = require("multer");

const {
  CloudinaryStorage
} = require("multer-storage-cloudinary");

const cloudinary = require("./cloudinary");

const path = require("path");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
    const isPdf = ext === 'pdf';
    
    const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    if (isPdf) {
  return {
    folder: "smartprint",
    resource_type: "auto",
    public_id: `${baseName}-${uniqueSuffix}`
  };
    } else {
      // For raw files (Word, zip, etc.), include the extension in public_id
      return {
        folder: "smartprint",
        resource_type: "raw",
        public_id: `${baseName}-${uniqueSuffix}.${ext}`
      };
    }
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
