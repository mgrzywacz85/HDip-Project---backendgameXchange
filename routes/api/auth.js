const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

//Private
//Route:        GET api/auth
//Desc:         Authentication
    
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error from Auth path");
  }
});

//Public
//Route:        POST api/auth
//Desc:         Authenticate user and get token
   
router.post(
  "/",
  [
    check("email", "Please provide a valid e-mail").isEmail(),
    check("password", "Please provide your password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //Check if the user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Please provide valid credentials" }] });
      }

      //Check if password matches

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Please provide valid credentials" }] });
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
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      ); 
    } catch (err) {
      console.error(err.message);
      res.status(500).send("5XX server error");
    }
  }
);

module.exports = router;
