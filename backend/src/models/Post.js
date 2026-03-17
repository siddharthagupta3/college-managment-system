const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  image: {
    type: String,
    default: ""
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

// Virtual for formatted time
postSchema.virtual('formattedTime').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  if (diff < 60000) { // less than 1 minute
    return 'just now';
  } else if (diff < 3600000) { // less than 1 hour
    return Math.floor(diff / 60000) + ' min ago';
  } else if (diff < 86400000) { // less than 1 day
    return Math.floor(diff / 3600000) + ' hours ago';
  } else {
    return this.createdAt.toLocaleDateString();
  }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => 
    like.user.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    // Remove like
    this.likes.splice(likeIndex, 1);
  } else {
    // Add like
    this.likes.push({
      user: userId,
      likedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(userId, text) {
  this.comments.push({
    user: userId,
    text: text,
    createdAt: new Date(),
    likes: []
  });
  
  return this.save();
};

// Method to remove comment
postSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => 
    comment._id.toString() !== commentId.toString()
  );
  
  return this.save();
};

// Method to toggle comment like
postSchema.methods.toggleCommentLike = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (!comment) return Promise.reject('Comment not found');
  
  const likeIndex = comment.likes.findIndex(like => 
    like.user.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    // Remove like
    comment.likes.splice(likeIndex, 1);
  } else {
    // Add like
    comment.likes.push({
      user: userId,
      likedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to edit post
postSchema.methods.editPost = function(newText) {
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  
  return this.save();
};

// Method to soft delete post
postSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  
  return this.save();
};

// Pre-find middleware to exclude deleted posts
postSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Populate user info on queries
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'userId',
    select: 'name profileImage'
  }).populate({
    path: 'comments.user',
    select: 'name profileImage'
  });
  next();
});

module.exports = mongoose.model("Post", postSchema);
