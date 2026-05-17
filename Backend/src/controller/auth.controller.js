const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing")
}
// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        // Email format validation
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            })
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            })
        }

        const isUserAlreadyExist = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExist) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({
            message: "Error registering user",
            error: error.message
        })
    }
}



async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })

        res.status(200).json({
            message: "User loggedIn Successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({
            message: "Error logging in user",
            error: error.message
        })
    }
}


async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token")

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        console.error("Error logging out user:", error);
        return res.status(500).json({
            message: "Error logging out user",
            error: error.message
        })
    }
}


async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Error fetching user details:", error);
        return res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}