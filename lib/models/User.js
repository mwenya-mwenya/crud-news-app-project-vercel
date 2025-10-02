import mongoose from 'mongoose';


//Mongoose schema for storing user accounts.

const userSchema = new mongoose.Schema(
  {
    // User's email address
    email: {
      type: String,
      unique: true,       // Ensures no duplicate emails
      required: true,     // Must be provided during registration
      lowercase: true,    // Normalizes email casing
      index: true         // Speeds up queries by email
    },

    // Hashed password (never store plain text passwords!)
    passwordHash: {
      type: String,
      required: true
    },

    // Optional display name or username
    username: {
      type: String,
      trim: true          // Removes leading/trailing whitespace
    }
  },

  // Automatically adds createdAt and updatedAt timestamps
  { timestamps: true }
);

// Export the model for use in authentication and user management
export const User = mongoose.model('User', userSchema);