// Menangani JSON body yang rusak dan error tak terduga (mis. database mati).
const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};

module.exports = errorHandler;
