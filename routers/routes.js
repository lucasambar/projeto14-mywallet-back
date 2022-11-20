import { Router } from "express"
import { getWallet, postWallet } from './controllers/wallet.controllers';
import { userSignIn, userSignUp } from './controllers/users.controllers';

const router = Router();
router.post("/sign-up", userSignUp)

router.post("/sign-in", userSignIn)

router.post("/wallet", postWallet)

router.get("/wallet", getWallet)

export default router
