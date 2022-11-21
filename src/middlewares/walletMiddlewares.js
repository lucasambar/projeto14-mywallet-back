import { walletSchema } from "../index.js";
import {collectionSessions, collectionWallet} from "../db/dbs.js"

export async function postWalletMiddleware (req, res, next){
    const {authorization} = req.headers
    const token =  authorization?.replace('Bearer ', '');

    if (!token) {res.sendStatus(401);return}

    const session = await collectionSessions.findOne({token})
    if (!session) {res.sendStatus(401); return}

    const validation = walletSchema.validate(req.body, {abortEarly: false})
    if (validation.error) {
        res.status(422).send("Confira se dados foram preenchidos adequadamente!");
        return;
    }

    next()
}
export async function getWalletMiddleware (req, res, next) {
    const {authorization} = req.headers
    const token =  authorization?.replace('Bearer ', '');
        
    if (!token) {res.sendStatus(401);return}
        
    const session = await collectionSessions.findOne({token})
    if (!session) {res.sendStatus(401); return}
    
    next()
}