const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { User, validateUser } = require("../models/user");
const { Post, validatePost } = require("../models/post");
const { validateComment } = require("../models/comment");

//Get all User Data//
router.get("/user", async (req, res) => {
    try {
      const user = await User.find();
      return res.send(user);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
  });

//Get specific User//
router.get("/user/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      return res.send(user);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
  });

//Get all Post Data//
router.get("/post", async (req, res) => {
    try {
      const post = await Post.find();
      return res.send(user);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
  });

//Use this to Register a user//
router.post("/user", async (req, res) => {
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

  router.post('/:postId/comment', async (req, res) => {
    try{
        const { error } = validateComment(req.body);
        if (error)
            return res.status(400).send(error);
        
        const post = await Post.findById(req.params.commentId);
        if(!post) return res.status(400).send(`The post with id "${req.params.commentId} does not exit.`);

        const comment = new Comment({
            username: req.body.username,
            text: req.body.text,
        })

        await comment.save();

        post.comment.push(comment);

        await post.save();
        return res.send(post.comment);
    } catch (ex) {
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
})

module.exports = router;