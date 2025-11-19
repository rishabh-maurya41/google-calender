import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Implements error handling and connection event listeners
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri);

    console.log('✓ MongoDB connected successfully');

    // Connection event listeners
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB database
 * Useful for graceful shutdown
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};
