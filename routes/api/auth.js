const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

//route:        GET api/auth
//desc:         Authentication
//access:       Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error from Auth path");
  }
});

//route:        POST api/auth
//desc:         Authenticate user and get token
//access:       Public
router.post(
  "/",
  [
    check("email", "Please enter a valid e-mail").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; //destructuring from req.body

    try {
      //Check if the user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      //Check if password matches

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      //Return the JWT token to allow for immediate login after registration

      const payload = {
        user: {
          id: user.id
        },
      };

      jwt.sign(
        payload,
        config.get("JWT_SECRET"),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      ); //revert to 3600 seconds for Prod
    } catch (err) {
      console.error(err.message);
      res.status(500).send("5XX server error");
    }
  }
);

module.exports = router;
