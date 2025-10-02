import mongoose from 'mongoose';

/**
 * NOT IMPLEMENTED
 * Mongoose schema for storing news articles.
 * Each article is linked to a user and includes metadata for filtering, display, and read tracking.
 */
const articleSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this article
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',           // Enables population of user data
      index: true,           // Speeds up queries by owner
      required: true         // Must be linked to a user
    },

    // Headline or title of the article
    title: {
      type: String,
      required: true
    },

    // URL to the full article
    url: {
      type: String,
      required: true
    },

    // Source name (e.g., BBC, Reuters)
    source: {
      type: String
    },

    // Short summary or description of the article
    summary: {
      type: String
    },

    // Optional tags for categorization or filtering
    tags: [{
      type: String
    }],

    // Flag to track whether the user has marked this article as read
    isRead: {
      type: Boolean,
      default: false
    }
  },

  // Automatically adds createdAt and updatedAt timestamps
  { timestamps: true }
);

// Export the model for use in controllers and services
export const Article = mongoose.model('Article', articleSchema);