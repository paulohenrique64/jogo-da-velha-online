const express = require("express");
const router = express.Router();

import { loginPage } from "../controllers/auth";
import { loginUser } from "../controllers/auth";
import { registerPage } from "../controllers/auth";
import { registerUser } from "../controllers/auth";
import { logoutUser } from "../controllers/auth";
import { forgotPassword } from "../controllers/auth";
import { resetPassword } from "../controllers/auth";
import { getHomepage } from '../controllers/home'
import { getGamePage } from '../controllers/game'
import { authMiddleware } from "../middlewares/auth";
import { noAuthMiddleware } from "../middlewares/auth";

router.get("/", getHomepage)                     // get home page
router.get("/login", noAuthMiddleware, loginPage);                 // get login page
router.get("/register", registerPage);                             // get register page
router.get("/game", authMiddleware, getGamePage);                  // get game page
router.get("/logout", authMiddleware, logoutUser);                 // logout 
router.post("/login/user", noAuthMiddleware, loginUser);           // login 
router.post("/register/user", registerUser);                       // register                                                
router.post("/forgot-password", noAuthMiddleware, forgotPassword); // forgot pasowrd
router.post("/reset-password", noAuthMiddleware, resetPassword);   // reset password

module.exports = router;















