const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller");
const {
  validateProduct,
  validateId,
} = require("../middleware/validate-product");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", validateId, getProductById);
router.post("/", validateProduct, createProduct);
router.put("/:id", validateId, validateProduct, updateProduct);
router.delete("/:id", validateId, deleteProduct);

module.exports = router;
