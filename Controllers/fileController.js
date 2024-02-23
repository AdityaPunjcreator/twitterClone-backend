const uploadFile = (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).json({ error: "File not found" });
    }
    return response.status(201).json({ filename: request.file.filename });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

const downloadFile = (request, response) => {
  try {
    const { filename } = request.params; // extracting the filename from request.params
    // now defining the path where the file will be stored
    const path = "./Uploads/";
    response.download(path + filename, (error) => {
      if (error) {
        console.log(error);
        response
          .status(500)
          .json({ error: "file cannot be downloaded" + error });
      }
    });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

module.exports = { uploadFile, downloadFile };
