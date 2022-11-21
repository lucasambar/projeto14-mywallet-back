import { Router } from "express"
import { getWallet, postWallet } from '../controllers/walletControllers.js'; 
import { postWalletMiddleware, getWalletMiddleware  } from "../middlewares/walletMiddlewares.js";

const router = Router();
router.post("/wallet", postWalletMiddleware, postWallet)
router.get("/wallet", getWalletMiddleware, getWallet)


export default router