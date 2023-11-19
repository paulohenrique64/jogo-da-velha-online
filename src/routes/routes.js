const express = require("express");
const router = express.Router();

import { onlyAuth, onlyGuest, onlyAdmin } from "../middlewares/auth";
import { getHomepage } from "../controllers/home";
import { getGamePage } from "../controllers/game";
import {
  registerPage,
  loginPage,
  getSettingsPage,
  loginUser,
  registerUser,
  logoutUser,
  deleteUser,
  editUser,
  forgotPassword,
  resetPassword,
  getUsers
} from "../controllers/auth";

// pages
router.get("/", getHomepage);                             // home page
router.get("/register", registerPage);                    // register page
router.get("/login", onlyGuest, loginPage);               // login page
router.get("/game", onlyAuth, getGamePage);               // game page
router.get("/settings", onlyAuth, getSettingsPage);       // settings page

// auth rotes
router.post("/login", onlyGuest, loginUser);              // login user
router.post("/register", registerUser);                   // register user
router.get("/logout", onlyAuth, logoutUser);              // logout user

// melhorar
// router.get("/user", onlyAuth, getUser);
router.get("/users", onlyAdmin, getUsers);
router.delete("/user/:id", onlyAuth, deleteUser);              // delete user
router.patch("/user", onlyAuth, editUser);                 // edit user
router.post("/user/forgot-password", forgotPassword);      // generate token: forgot pasoword
router.post("/user/password", resetPassword);              // reset password (with a  forgot pasoword token)

module.exports = router;
