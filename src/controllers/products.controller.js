const products = [
  { id: 1, name: "Buku", price: 15000 },
  { id: 2, name: "Pulpen", price: 5000 },
];

const getProducts = (req, res) => {
  res.json(products);
};

const getProductById = (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

const createProduct = (req, res) => {
  const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    price: req.body.price,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
};

module.exports = { getProducts, getProductById, createProduct };
