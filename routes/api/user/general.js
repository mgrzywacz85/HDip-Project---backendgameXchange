const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../../../models/User");

//Public
//Route:        POST api/user/general
//Desc:         Registering/managing users

router.post(
  "/",
  [
    check("name", "Please provide your username").not().isEmpty(),
    check("email", "Please provide a valid e-mail").isEmail(),
    check(
      "password",
      "Please provide a password with at least 6 characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, avatar, password } = req.body; //destructuring from req.body

    try {

      //Check if the User already exists

      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      //Get gravatar from email and to be used if the User does not provide the External link to their photo

      const altGravatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      if (!avatar) {
        user.avatar = altGravatar;
      }

      //Encrypt the provided password

      const salt = await bcrypt.genSalt(10); //Recommended salt value from docs

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //Return the JWT token to allow for immediate login after registration

      const payload = {
        user: {
          id: user.id,
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
