const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

// FIX: guard against missing JWT_SECRET at startup, not silently at runtime
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing")
}

async function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not Provided"
        })
    }

    try {
        const isTokenBlackListed = await tokenBlacklistModel.findOne({ token })

        if (isTokenBlackListed) {
            return res.status(401).json({
                message: "Token is invalid"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()

    } catch (err) {
        return res.status(401).json({
            message: "Invalid token."
        })
    }
}

module.exports = { authUser };