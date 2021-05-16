const { User } = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(userList);
});
router.get(`/:id`, async (req, res) => {
  const userList = await User.findById(req.params.id).select("-passwordHash");
  if (!userList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(userList);
});
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await category.save();

  if (!user) return res.status(404).send("the user cannot be created");

  res.send(user);
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = "my-dog-is-nice";
  if (!user) {
    return res.status(400).send("the user not found");
  }
  // console.log(bcrypt.compareSync(req.body.passwordHash, user.passwordHash));
  if (user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin:user.isAdmin
      },
      secret,
      { expiresIn: "1w" }
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wrong");
  }
  // return res.status(200).send(user)
});

router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) return res.status(404).send("the user cannot be created");

  res.send(user);
});
router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    count: userCount,
  });
});

router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((User) => {
      if (User) {
        return res.status(200).json({
          success: true,
          message: "the User is sucessfully deleted",
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});
module.exports = router;

