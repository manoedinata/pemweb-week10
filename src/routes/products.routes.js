const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
} = require("../controllers/products.controller");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);

module.exports = router;
