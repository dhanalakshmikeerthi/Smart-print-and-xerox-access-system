exports.uploadFile = async (req, res) => {
  try {

    console.log(req.file);

    res.json({
      success: true,
      fileUrl: req.file.path,
      public_id: req.file.filename
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};