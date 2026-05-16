const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);

    // Handle multer errors
    if (err.name === "MulterError") {
        if (err.code === "FILE_TOO_LARGE") {
            return res.status(400).json({
                message: "File size exceeds the 3MB limit",
                error: err.message
            });
        }
        return res.status(400).json({
            message: "File upload error",
            error: err.message
        });
    }

    // Handle custom errors
    if (err.message && err.message.includes("Only PDF files")) {
        return res.status(400).json({
            message: "Only PDF files are allowed",
            error: err.message
        });
    }

    // Generic error handler
    res.status(err.statusCode || 500).json({
        message: "Internal server error",
    });
});

module.exports = app
