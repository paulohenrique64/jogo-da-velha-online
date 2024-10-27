const express = require("express");
const router = express.Router();

import {onlyAuth, onlyGuest, onlyAdmin} from "../middlewares/auth";
import {getHomepage} from "../controllers/home";
import {getGamePage} from "../controllers/game";
import {registerPage, loginPage, getSettingsPage, getAdminSettingsPage, forgotPasswordPage, resetPasswordPage} from "../controllers/auth";
import {loginUser, registerUser, logoutUser, deleteUser} from "../controllers/auth";
import {getUser, getUsers, forgotPassword, resetPassword} from "../controllers/auth";
import {editUserEmail, editUserNickname, editUserPassword} from "../controllers/auth";

// páginas
router.get("/", onlyGuest, getHomepage);                               // pagina principal
// router.get("/register", onlyGuest, registerPage);                   // pagina de registro
// router.get("/login", onlyGuest, loginPage);                         // pagina de login
router.get("/game", onlyAuth, getGamePage);                            // pagina do jogo
// router.get("/settings", onlyAuth, getSettingsPage);                 // pagina de configuracoes para usuarios normais
// router.get("/adminSettings", onlyAdmin, getAdminSettingsPage);      // pagina de configuracoes para admins
// router.get("/forgot-password", onlyGuest, forgotPasswordPage)       // pagina de forgot-password
// router.get("/reset-password/:token", onlyGuest, resetPasswordPage)  // pagina de reset-password 

// rotas para autenticação
router.post("/login", loginUser);                                      // fazer o login de um usuario
// router.post("/register", registerUser);                             // registrar usuario
router.get("/logout", onlyAuth, logoutUser);                           // logout do usuario

// rotas de acesso a usuarios
router.get("/user", onlyAuth, getUser);                                // retorna um usuário em específico
// router.get("/users", onlyAdmin, getUsers);                          // retorna todos os usuários cadastrados

// rotas de edição de usuarios
// router.post("/user/forgot-password", onlyGuest, forgotPassword);    // gerar token de forgot password
// router.post("/user/password/:token", onlyGuest, resetPassword);     // resetar senha com token de forgot password
// router.post("/user/nickname", onlyAuth, editUserNickname);          // editar o nickname de um usuario
// router.post("/user/email", onlyAuth, editUserEmail);                // editar o email de um usuario
// router.post("/user/password", onlyAuth, editUserPassword);          // editar a senha de um usuario
// router.delete("/user/:id", onlyAuth, deleteUser);                   // deletar usuario

module.exports = router;
