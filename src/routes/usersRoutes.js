import { Router } from "express"
import { userSignIn, userSignUp } from '../controllers/usersControllers.js';
import { userSignUpMiddleware } from "../middlewares/usersMiddlewares.js";


const router = Router();
router.post("/sign-up", userSignUpMiddleware, userSignUp)
router.post("/sign-in", userSignIn)


export default router
