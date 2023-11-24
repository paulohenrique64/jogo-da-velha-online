const express = require("express");
const router = express.Router();

import {onlyAuth, onlyGuest, onlyAdmin} from "../middlewares/auth";
import {getHomepage} from "../controllers/home";
import {getGamePage} from "../controllers/game";
import {registerPage, loginPage, getSettingsPage, forgotPasswordPage, resetPasswordPage} from "../controllers/auth";
import {loginUser, registerUser, logoutUser, deleteUser} from "../controllers/auth";
import {editUser, getUser, getUsers, forgotPassword, resetPassword} from "../controllers/auth";

// páginas
router.get("/", getHomepage);                                       // pagina principal
router.get("/register", registerPage);                              // pagina de registro
router.get("/login", onlyGuest, loginPage);                         // pagina de login
router.get("/game", onlyAuth, getGamePage);                         // pagina do jogo
router.get("/settings", onlyAuth, getSettingsPage);                 // pagina de configuracoes
router.get("/forgot-password", onlyGuest, forgotPasswordPage)       // pagina de forgot-password
router.get("/reset-password/:token", onlyGuest, resetPasswordPage)  // pagina de reset-password 

// rotas para autenticação
router.post("/login", onlyGuest, loginUser);                        // fazer o login de um usuario
router.post("/register", registerUser);                             // registrar usuario
router.get("/logout", onlyAuth, logoutUser);                        // logout do usuario

// rotas de acesso e edição de usuários
router.get("/user", onlyAuth, getUser);                             // retorna um usuário em específico
router.get("/users", onlyAdmin, getUsers);                          // retorna todos os usuários cadastrados
router.delete("/user/:id", onlyAuth, deleteUser);                   // deletar usuario
router.patch("/user", onlyAuth, editUser);                          // editar usuario
router.post("/user/forgot-password", onlyGuest, forgotPassword);    // gerar token de forgot password
router.post("/user/password/:token", onlyGuest, resetPassword);     // resetar senha com token de forgot password

module.exports = router;
