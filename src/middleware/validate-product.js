// Validasi body untuk POST dan PUT: name wajib string tidak kosong,
// price wajib bilangan bulat >= 0.
const validateProduct = (req, res, next) => {
  const errors = [];
  const { name, price } = req.body ?? {};

  if (typeof name !== "string" || name.trim() === "") {
    errors.push("name wajib diisi dan berupa string");
  }
  if (!Number.isInteger(price) || price < 0) {
    errors.push("price wajib diisi dan berupa bilangan bulat >= 0");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation error", errors });
  }

  req.body = { name: name.trim(), price };
  next();
};

// Validasi parameter :id agar berupa bilangan bulat positif.
const validateId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res
      .status(400)
      .json({ message: "Validation error", errors: ["id harus bilangan bulat positif"] });
  }
  req.productId = id;
  next();
};

module.exports = { validateProduct, validateId };
