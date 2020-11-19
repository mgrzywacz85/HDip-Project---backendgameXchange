const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middlewares/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");

//Private
//Route:        POST api/posts
//Desc:         Create a post
     
router.post(
  "/",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("description", "Description is required").not().isEmpty(),
      check("preferredlocation", "Preferred location is required")
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).populate(
        "user",
        "-password"
      );

      const newPost = new Post({
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        photo: req.body.photo,
        preferredlocation: req.body.preferredlocation
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//Public
//route:        GET api/posts
//desc:         Get all posts

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//Public
//Route:        GET api/posts/:id
//Desc:         Get post by ID
     

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});

//Private
//Route:        DELETE api/posts/:id
//Desc:         Delete post by ID
     

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if Post exists

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //Make sure the User deleting the Post is the original poster

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post deleted" });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

//Private
//Route:        PUT api/posts/like/:id
//Desc:         Like post
    

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if Post already liked by the User

    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//Private
//Route:        PUT api/posts/unlike/:id
//Desc:         Unlike post
   

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if already Post already liked by the User

    //If equal to zero then the User has not liked the post yet

    if (
      post.likes.filter((like) => like.user.toString() == req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post not liked yet" });
    }

    //Get remove index

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//Private
//Route:        POST api/posts/comment/:post_id
//Desc:         Comment on a post
      
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
        isSelected: false
      };

      post.comments.push(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//Private
//Route:        DELETE api/posts/comment/:post_id/:comment_id
//Desc:         Delete comment from post
      

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Get comment by id

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //Check if Comment exists

    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    //Check if valid User is making the request
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    //Remove

    const removeIndex = post.comments
      .map((comment) => comment.isSelected.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//Private
//Route:        PUT api/posts/comment/:post_id/:comment_id/complete
//Desc:         Accept Xchange (put in Pending state)       

router.put("/comment/:id/:comment_id/accept", auth, async (req, res) => {

    try {

      const post = await Post.findById(req.params.id);

      //Get comment by id
  
      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );
      
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: "User not authorized" });
      }

    comment.isSelected = true;

    post.isAccepted = true;    

    await post.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//Private
//route:        PUT api/posts/comment/:post_id/:comment_id/complete
//desc:         Complete Xchange (the selected Commenter chooses this - put in Successful state)
   

router.put("/comment/:id/:comment_id/complete", auth, async (req, res) => {

  try {

    const post = await Post.findById(req.params.id);

    //Get comment by ID

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

  comment.isSelected = true;

  post.isCompleted = true;    

  await post.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
}
);

module.exports = router;
