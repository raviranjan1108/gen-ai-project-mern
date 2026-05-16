const mongoose = require("mongoose")

async function connectToDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI missing")
    }

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("🚀 Database Connected Successfully");
    }
    catch (err) {
        console.error("❌ Database Connection Failed:", err.message)
        process.exit(1)
    }
}

module.exports = connectToDB