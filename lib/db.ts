import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: 'autoRack',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);

    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
