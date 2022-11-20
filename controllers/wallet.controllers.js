import { walletSchema } from "..";
import dayjs from 'dayjs';

export async function postWallet (req, res) {
    const {authorization} = req.headers
    const token =  authorization?.replace('Bearer ', '');

    if (!token) {res.sendStatus(401);return}

    const session = await collectionSessions.findOne({token})
    if (!session) {res.sendStatus(401); return}

    const validation = walletSchema.validate(req.body, {abortEarly: false})
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        res.status(422).send(errors);
        return;
    }

    const {type, amount, description} = req.body
    const wallet = {
        userId: session.userId,
        type,
        amount,
        description,
        date: dayjs().format("DD/MM")
    }

    await collectionWallet.insertOne(wallet)

    let balanceDB = await collectionBalance.findOne({userId: session.userId})

    if (!balanceDB) {
        balanceDB = {
            userId: session.userId,
            balance: 0
        }
        await collectionBalance.insertOne(balanceDB)
    }

    let balance;
    switch (type) {
        case ("exit") :
            balance = balanceDB.balance - amount
            await collectionBalance.updateOne({userId: session.userId}, { $set: {balance: balance} })
            break
        case ("entrance") :
            balance = Number(balanceDB.balance) + Number(amount)
            await collectionBalance.updateOne({userId: session.userId}, { $set: {balance: balance} })
            break
    }

    res.send(balanceDB)
}

export async function getWallet (req, res) {
    const {authorization} = req.headers
    const token =  authorization?.replace('Bearer ', '');
    
    if (!token) {res.sendStatus(401);return}
    
    const session = await collectionSessions.findOne({token})
    if (!session) {res.sendStatus(401); return}
    
    const wallet = await collectionWallet.find({
        $or : [{userId: session.userId}]
    }).toArray()
    
    const balance = await collectionBalance.findOne({userId: session.userId})
    
    let response;
    if (!balance) {
        response;response = {balance: 0, wallet}
    } else{
        response = {balance: balance.balance, wallet}
    }
    
    
    res.send(response)
}