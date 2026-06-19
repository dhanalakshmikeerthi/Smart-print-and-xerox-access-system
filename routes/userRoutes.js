const express = require("express");

const router = express.Router();



const User =
require("../models/User");

const bcrypt = require("bcryptjs");

// SIGNUP API
router.post(
  "/signup",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
        role
      } = req.body;

      // CHECK USER
      const existingUser =
        await User.findOne({
          email
        });

      if (existingUser) {

        return res.json({
          success: false,
          message:
            "User Already Exists!"
        });
      }

      // CREATE USER
      const hashedPassword =
  await bcrypt.hash(
    password,
    10
  );

const newUser =
  new User({
    name,
    email,
    password: hashedPassword,
    role
  });

      await newUser.save();

      res.json({
        success: true,
        message:
          "Signup Successful!"
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// LOGIN API
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    const user =
      await User.findOne({ email });

    console.log("USER:", user);

    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found"
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "VALID PASSWORD:",
      validPassword
    );

    if (!validPassword) {
      return res.json({
        success: false,
        message: "Invalid Credentials"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false
    });

  }

});
// GET USERS
router.get(
  "/users",
  async (req, res) => {

    const users =
      await User.find();

    res.json(users);
  }
);

module.exports = router;