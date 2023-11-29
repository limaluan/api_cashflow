import { Router } from "express";
import { authMiddleware } from "./middlewares/authMiddleware";
import {
  UserController,
  LoginController,
  TransactionController,
} from "./controllers";

const routes = Router();

routes.post("/user", new UserController().create);
routes.post("/login", new LoginController().login);

routes.use(authMiddleware);

routes.get("/user", new UserController().get);
routes.get("/user/transactions", new TransactionController().get);
routes.post("/user/transactions", new TransactionController().create);
routes.get("/user/transactions/name", new TransactionController().getByName);
routes.get("/user/transactions/balance", new TransactionController().getBalance);

export default routes;
