const express = require("express");
const authController = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = express.Router()

authRouter.post("/register", authController.registerUserController);

authRouter.post("/login", authController.loginUserController);

// FIX: changed GET to POST — logout modifies server state (blacklists token)
authRouter.post("/logout", authController.logoutUserController);

authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

module.exports = authRouter