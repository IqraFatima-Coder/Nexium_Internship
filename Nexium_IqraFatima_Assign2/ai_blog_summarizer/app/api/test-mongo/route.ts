import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/client';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Try to connect to database
    await connectToDatabase();

    // Get connection status
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      // Get database information
      const dbName = mongoose.connection.db?.databaseName || 'unknown';
      const collections = await mongoose.connection.db?.listCollections().toArray() || [];
      
      return NextResponse.json({
        status: 'success',
        connected: true,
        database: {
          name: dbName,
          collections: collections.map(col => col.name),
        },
        connectionString: process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || 'hidden',
      });
    } else {
      return NextResponse.json({
        status: 'error',
        connected: false,
        message: 'Not connected to MongoDB',
      }, { 
        status: 500 
      });
    }
  } catch (error) {
    console.error('MongoDB test error:', error);
    return NextResponse.json({
      status: 'error',
      connected: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { 
      status: 500 
    });
  }
}
