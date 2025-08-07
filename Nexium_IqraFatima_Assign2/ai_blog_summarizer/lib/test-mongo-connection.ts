// Simple MongoDB Connection Test
// Run this to verify your MongoDB Atlas connection

import dbConnect from '@/lib/mongodb/client';
import BlogContent from '@/models/BlogContent';

export async function testMongoConnection() {
  try {
    console.log('🔄 Testing MongoDB Connection...');
    
    // Test connection
    await dbConnect();
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // Test document creation
    const testDoc = {
      url: 'https://test-connection.example.com',
      content: 'This is a test document to verify MongoDB Atlas connection and data storage.',
      title: 'MongoDB Connection Test',
      summary: 'Test summary for verification'
    };
    
    console.log('🔄 Creating test document...');
    const created = await BlogContent.create(testDoc);
    console.log('✅ Test document created with ID:', created._id);
    
    // Test document retrieval
    console.log('🔄 Retrieving test document...');
    const retrieved = await BlogContent.findById(created._id);
    console.log('✅ Document retrieved successfully');
    console.log('📄 Document data:', {
      id: retrieved?._id,
      url: retrieved?.url,
      title: retrieved?.title,
      contentLength: retrieved?.content?.length
    });
    
    // Clean up test document
    console.log('🔄 Cleaning up test document...');
    await BlogContent.findByIdAndDelete(created._id);
    console.log('✅ Test document cleaned up');
    
    // Get collection stats
    const count = await BlogContent.countDocuments();
    console.log('📊 Total documents in collection:', count);
    
    return {
      success: true,
      message: 'MongoDB Atlas connection verified successfully',
      documentsCount: count
    };
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error
    };
  }
}
