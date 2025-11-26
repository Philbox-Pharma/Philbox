import mongoose from 'mongoose';

async function connectDB(uri) {
  try {
    const connecttoMongo = await mongoose.connect(uri);
    if (connecttoMongo) {
      console.log('MongoDB Connected');
    } else {
      console.log('error connecting ');
    }
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

export default connectDB;
