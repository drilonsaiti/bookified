import mongoose from "mongoose";

const getMongoUri = () => {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI is not defined");
        return uri;
};

declare global {
    var mongoseCache: {
        conn: typeof mongoose | null,
        promise: Promise<typeof mongoose> | null
    }
}

let cached = global.mongoseCache || (global.mongoseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
    if(cached.conn) return cached.conn;

    if(!cached.promise) {
        cached.promise = mongoose.connect(getMongoUri(),{bufferCommands: false});
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error('MongoDB connection error:', error);
        throw error;
    }
    console.info('Connected to MongoDB');
    return cached.conn;
}