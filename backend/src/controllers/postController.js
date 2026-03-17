const Post = require("../models/Post");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { text, image, tags } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: "Post text is required" });
    }

    const post = new Post({
      userId: req.user._id,
      text: text.trim(),
      image: image || "",
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    });

    await post.save();
    await post.populate('userId', 'name profileImage');

    res.status(201).json({
      message: "Post created successfully",
      post
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// Get all posts (community feed)
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name profileImage')
      .populate('comments.user', 'name profileImage');

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('userId', 'name profileImage')
      .populate('comments.user', 'name profileImage');

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

// Like/unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.toggleLike(req.user._id);
    await post.populate('userId', 'name profileImage');

    res.json({
      message: post.isLikedBy(req.user._id) ? "Post liked" : "Post unliked",
      likeCount: post.likeCount,
      isLiked: post.isLikedBy(req.user._id)
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// Add comment to a post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await post.addComment(req.user._id, text.trim());
    await post.populate('comments.user', 'name profileImage');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Remove comment from a post
exports.removeComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment author or post author
    if (comment.user.toString() !== req.user._id.toString() && 
        post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await post.removeComment(req.params.commentId);

    res.json({ message: "Comment removed successfully" });
  } catch (error) {
    console.error("Remove comment error:", error);
    res.status(500).json({ message: "Failed to remove comment" });
  }
};

// Like/unlike a comment
exports.toggleCommentLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await post.toggleCommentLike(req.params.commentId, req.user._id);

    const likeCount = comment.likes.length;
    const isLiked = comment.likes.some(like => 
      like.user.toString() === req.user._id.toString()
    );

    res.json({
      message: isLiked ? "Comment liked" : "Comment unliked",
      likeCount,
      isLiked
    });
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res.status(500).json({ message: "Failed to toggle comment like" });
  }
};

// Edit a post
exports.editPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: "Post text is required" });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the post author
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    await post.editPost(text.trim());
    await post.populate('userId', 'name profileImage');

    res.json({
      message: "Post updated successfully",
      post
    });
  } catch (error) {
    console.error("Edit post error:", error);
    res.status(500).json({ message: "Failed to edit post" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the post author or admin
    if (post.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.softDelete();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

// Pin/unpin a post (admin only)
exports.togglePin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      message: post.isPinned ? "Post pinned" : "Post unpinned",
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error("Toggle pin error:", error);
    res.status(500).json({ message: "Failed to toggle pin" });
  }
};
