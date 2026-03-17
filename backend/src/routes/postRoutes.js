const express = require("express");
const { requireAuth } = require("../middleware/auth");
const postController = require("../controllers/postController");

const router = express.Router();

// All post routes require authentication
router.use(requireAuth);

// Create a new post
router.post("/", postController.createPost);

// Get all posts (community feed)
router.get("/", postController.getAllPosts);

// Get a single post
router.get("/:postId", postController.getPost);

// Like/unlike a post
router.post("/:postId/like", postController.toggleLike);

// Add comment to a post
router.post("/:postId/comments", postController.addComment);

// Remove comment from a post
router.delete("/:postId/comments/:commentId", postController.removeComment);

// Like/unlike a comment
router.post("/:postId/comments/:commentId/like", postController.toggleCommentLike);

// Edit a post
router.put("/:postId", postController.editPost);

// Delete a post
router.delete("/:postId", postController.deletePost);

// Pin/unpin a post (admin only)
router.post("/:postId/pin", postController.togglePin);

module.exports = router;
