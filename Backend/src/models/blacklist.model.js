const mongoose = require("mongoose")

const blacklistToken = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to be added in blacklist"],
        index: true  // FIX: fast lookup on every authenticated request
    }
}, {
    timestamps: true
})

// FIX: auto-delete blacklisted tokens after 24 hours (matches JWT expiry)
blacklistToken.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistToken);

module.exports = tokenBlacklistModel