const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const config = require("config");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const multer  = require('multer');
const { User, validateUser } = require("../models/user");
const { Post, validatePost } = require("../models/post");
const { Comment, validateComment } = require("../models/comment");
const {Image} = require("../models/image");

//Get all User Data//
router.get("/user", async (req, res) => {
    try {
      const user = await User.find();
      return res.send(user);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
  });

  router.get("/image", async (req, res) => {
    try {
      const image = await Image.find();
      return res.send(image);
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
      return res.send(post);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
  });

// router.get("/post/:username", async (req, res) => {
//     try {
//       const post = await Post.find(req.params.username);
//       return res.send(post);
//     } catch (ex) {
//       return res.status(500).send(`Internal Server Error: ${ex}`);
//     }
//   });

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

//   router.post("/userId/post", async (req, res) => {
//     try{
//         const { error } = validatePost(req.body);
//         if (error)
//             return res.status(400).send(error);
        
//         const user = await User.findById(req.params.userId);
//         if(!user) return res.status(400).send(`The post with id "${req.params.commentId} does not exit.`);
  
//       const post = new Post({
//         username: req.body.username,
//         text: req.body.text,
//         image: req.body.image,
//         rating: req.body.rating,
//       });
  
//       await post.save();
//       user.post.push(post);
  
//       await user.save();
//       return res.send(user.post);
//     } catch (ex) {
//       return res.send(500).send(`Internal Server Error: ${ex}`);
//     }
//   });

  router.post("/post", async (req, res) => {
    try{
        const { error } = validatePost(req.body);
        if (error)
            return res.status(400).send(error);
  
      const post = new Post({
        username: req.body.username,
        text: req.body.text,
        image: req.body.image,
        rating: req.body.rating,
      });
  
      await post.save();
  
      return res.send(post);
    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
  });

  router.post('/:postId/comment', async (req, res) => {
    try{
        const { error } = validateComment(req.body);
        if (error)
            return res.status(400).send(error);
        
        const post = await Post.findById(req.params.postId);
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
});

router.put("/like/:postId", async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      post.like = post.like + 1;
      await post.save();
      return res.status(200).send(post);
    } catch (err) {
      return res.status(500).send(`Internal Server Error: ${err}`);
    }
  });

router.delete("/postid", async (req, res) => {
  try {
    const post = await Post.findByIdAndRemove(req.params.id);

    if(!post)
    return res.status(400).send(`The post with id "${req.params.id}" does not exist`);
    return res.send(post);

  
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

router.delete("/:id/user", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted");
    if(!user)
    return res.status(400).send(`The user with id "${req.params.id}" does not exist`);
    return res.send(post);

  
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

router.delete("/:id", async (req, res) => {
    //Verify user ID
    if (req.body.userId === req.params.id || req.body.isAdmin) {
      try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Account has been deleted successfully");
      } catch (err) {
        return res.status(500).json(err);
      }
    } else {
      return res.status(403).json("You can only delete your own Account");
    }
  });

//image handling//

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/images');
    },
    filename: (req, file, cb) => {
      console.log(file);
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});

var upload = multer({storage: storage});

router.post("/upload", upload.single("file"), async (req, res) => {
    console.log('Route hit!', req.body.image);

    try {
      const url = req.protocol + "://" + req.get("host")
      const image = new Image({
        image: url + "/public/images" + req.file.filename,
      });

      await image.save()
      
      return res.status(200).send(image)

    } catch (ex) {
      return res.status(500).send(`Internal Server Error: ${ex}`);
    }
    
  })


module.exports = router;