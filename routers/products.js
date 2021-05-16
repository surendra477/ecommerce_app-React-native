const { Product } = require("../models/Products");
const express = require("express");
const { Category } = require("../models/category");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });
router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});
// router.get(`/`, async (req, res) => {
//   const productList = await Product.find().select("name image -_id");
//   if (!productList) {
//     res.status(500).json({
//       success: false,
//     });
//   }
//   res.send(productList);
// });
router.get(`/:id`, async (req, res) => {
  const productList = await Product.findById(req.params.id).populate(
    "category"
  );
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }
  const file = req.file;
  if (!file) {
    return res.status(400).send("No image in the request");
  }
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`; //https://localhost:3000/public/uploads/
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, //https://localhost:3000/public/uploads/image-1292021820
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  products = await product.save();
  if (!products) {
    return res.status(500).send("the product cannot be created");
  }
  res.send(products);
});
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Product");
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) {
    return res.status(400).send("the product cannot be updated");
  }
  res.send(product);
});
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((Product) => {
      if (Product) {
        return res.status(200).json({
          success: true,
          message: "the Product is sucessfully deleted",
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    count: productCount,
  });
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productfeatured = await Product.find({ isFeatured: true }).limit(
    +count
  );

  if (!productfeatured) {
    res.status(500).json({ success: false });
  }
  res.send({
    count: productfeatured,
  });
});
router.put("/gallery-images/:id", uploadOptions.array('images',10),async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
  const files = req.files
  let imagesPaths = [];
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
 
  if(files){
    files.map(file => {
      imagesPaths.push(`${basePath}${file.filename}`)
    })
  }

 const product = await Product.findByIdAndUpdate(
   req.params.id,
   {
     
     images: imagesPaths,
    
   },
   { new: true }
 );
if (!product) {
  return res.status(400).send("the product cannot be updated");
}
res.send(product);
}
)
module.exports = router;
