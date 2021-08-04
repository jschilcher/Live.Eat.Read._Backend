const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { User, validateUser } = require("../models/user");

router.post("/user", auth, async (req, res) => {
    try {
      const { error } = validateUser(req.body);
      if (error) return res.status(400).send(error);
      
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
      });
  
      await user.save();
  
      const token = user.generateAuthToken();
  
      return res
        .header("x-auth-token", token)
        .header("access-control-expose-headers", "x-auth-token")
        .send({ _id: user._id, name: user.name, email: user.email });
  
      return res.send(user);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
  });

module.exports = router;