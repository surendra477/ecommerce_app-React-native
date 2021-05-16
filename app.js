const express = require("express");
const app = express();
const bodyPaser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const authJwt = require("./helper/jwt");
const multer = require("multer")
let api = process.env.API_URL;
require("dotenv/config");
const cors = require("cors");
const errorHandler = require('./helper/error-handler');


// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads");
//   },
//   filename: function (req, file, cb) {
//     // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//      const fileName = file.originalname.split(' ').json('-') 
//     cb(null, fileName + "-" + Date.now());
//   },
// });

// const upload = multer({ storage: storage });
app.options("*", cors());

//middleware
app.use(bodyPaser.json());
app.use(morgan("tiny"));
app.use(authJwt());

app.use(errorHandler);
app.use('/public/uploads',express.static(__dirname + '/public/uploads'))
//Routers
const categoriesRoutes = require("./routers/categories");
const productsRoutes = require("./routers/products");
const usersRoutes = require("./routers/users");
const ordersRoutes = require("./routers/orders");

app.use(`/api/v1/categories`, categoriesRoutes);
app.use(`/api/v1/products`, productsRoutes);
app.use(`/api/v1/users`, usersRoutes);
app.use(`/api/v1/orders`, ordersRoutes);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "shop-database",
  })
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(3000, () => {
  console.log("the server is running in localhost 3000");
});
