import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

export async function connectMongoDB() {
	if (!MONGODB_URI) {
		throw new Error("MONGODB_URI environment variable is required");
	}

	await mongoose.connect(MONGODB_URI);
	console.log("You successfully connected to MongoDB!");
	return mongoose;
}

// Call this only when your application terminates
export async function disconnectMongoDB() {
	await mongoose.connection.close();
	console.log("You successfully disconnected from MongoDB!");
}
