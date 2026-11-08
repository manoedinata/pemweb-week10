const prisma = require("../lib/prisma");

// Kode error Prisma ketika record yang dicari untuk update/delete tidak ada.
const RECORD_NOT_FOUND = "P2025";

const getProducts = async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.productId },
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

const createProduct = async (req, res) => {
  const { name, price } = req.body;
  const product = await prisma.product.create({ data: { name, price } });
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const { name, price } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: req.productId },
      data: { name, price },
    });
    res.json(product);
  } catch (err) {
    if (err.code === RECORD_NOT_FOUND) {
      return res.status(404).json({ message: "Product not found" });
    }
    throw err;
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.delete({
      where: { id: req.productId },
    });
    res.json({ message: "Product deleted", product });
  } catch (err) {
    if (err.code === RECORD_NOT_FOUND) {
      return res.status(404).json({ message: "Product not found" });
    }
    throw err;
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
