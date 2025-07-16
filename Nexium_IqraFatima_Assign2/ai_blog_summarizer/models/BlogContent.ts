import mongoose, { Document, Schema } from 'mongoose';

interface IBlogContent extends Document {
  url: string;
  content: string;
  createdAt: Date;
  title?: string;
  summary?: string;
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
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
blogContentSchema.index({ url: 1 });
blogContentSchema.index({ createdAt: -1 });

const BlogContent = mongoose.models.BlogContent || mongoose.model<IBlogContent>('BlogContent', blogContentSchema);

export default BlogContent;
