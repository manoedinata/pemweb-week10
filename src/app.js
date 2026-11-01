const express = require("express");
const requestLogger = require("./middleware/request-logger");
const productsRoutes = require("./routes/products.routes");

const app = express();
app.use(express.json());
app.use(requestLogger);

app.use("/products", productsRoutes);

module.exports = app;
