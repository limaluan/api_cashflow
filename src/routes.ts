import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { LoginController } from "./controllers/LoginController";
import { authMiddleware } from "./middlewares/authMiddleware";

const routes = Router();

routes.post("/user", new UserController().create);
routes.post("/login", new LoginController().login);

routes.use(authMiddleware);

export default routes;
