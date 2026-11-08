const express = require("express");
const requestLogger = require("./middleware/request-logger");
const errorHandler = require("./middleware/error-handler");
const productsRoutes = require("./routes/products.routes");

const app = express();
app.use(express.json());
app.use(requestLogger);

app.use("/products", productsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

module.exports = app;
