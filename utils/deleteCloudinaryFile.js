const cloudinary = require(
  "../config/cloudinary"
);

const deleteCloudinaryFile = async (
  publicId,
  resourceType
) => {

  return await cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: resourceType
    }
  );
};

module.exports = deleteCloudinaryFile;