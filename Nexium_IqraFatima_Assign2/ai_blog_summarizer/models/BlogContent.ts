import mongoose, { Document, Schema } from 'mongoose';

interface IBlogContent extends Document {
  url: string;
  content: string;
  createdAt: Date;
  title?: string;
  summary?: string;
  userId?: string; // Associate content with user
  isSaved?: boolean; // Track if user explicitly saved this
  tags?: string[]; // Allow users to tag their content
}

const blogContentSchema: Schema = new Schema({
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  userId: {
    type: String,
    trim: true,
    index: true // Index for efficient user queries
  },
  isSaved: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance (url index already created by unique: true)
blogContentSchema.index({ createdAt: -1 });

const BlogContent = mongoose.models.BlogContent || mongoose.model<IBlogContent>('BlogContent', blogContentSchema);

export default BlogContent;
