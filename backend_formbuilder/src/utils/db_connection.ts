import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || ""

const connect_to_db = () => {
    mongoose.connect(MONGO_URI).then(() => {
        console.log("Connected to MongoDB")
    }).catch((err) => {
        console.error("MongoDB connection error:", err)
    })
}

export default connect_to_db