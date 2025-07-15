import mongoose from 'mongoose';

// Define the interface for the blog content
interface IBlogContent {
  url: string;
  content: string;
  createdAt: Date;
}

// Define the schema
const blogContentSchema = new mongoose.Schema<IBlogContent>({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
const BlogContent = mongoose.models.BlogContent || mongoose.model<IBlogContent>('BlogContent', blogContentSchema);

export default BlogContent;
