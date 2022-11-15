import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

//config
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

//data base
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try {
    db = await mongoClient.connect()
    console.log("Projeto conectado ao Mongo DB!")
} catch (erro) {console.log(erro)}

const collectionUsers = mongoClient.db("myWallet").collection("users")
const collectionSessions = mongoClient.db("myWallet").collection("sessoons")
const collectionWallet = mongoClient.db("myWallet").collection("wallet")
const collectionBalance = mongoClient.db("myWallet").collection("balance")

//joi schemma
const userSchema = joi.object({
    "name": joi.string().required().min(3),
    "email": joi.string().email().required(),
    "password": joi.string().required().min(3).alphanum(),
    "confirmePassword": joi.ref("password")
})
const walletSchema = joi.object({
    "type": joi.string().valid("entrance","exit").required(),
    "amount": joi.number().precision(2).required(),
    "description": joi.string().min(5).required() 
})
//routes
app.post("/sign-up", async (req,res) => {
    const user = req.body

    const validation = userSchema.validate(req.body, {abortEarly: false})

    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        res.status(422).send(errors);
        return;
    }

    try {
        const exist = await collectionUsers.findOne({email: user.email})
        if (exist) {
            res.status(409).send("Usuário já cadstrado!"); 
            return
        }

    } catch (erro) {console.log(erro); res.sendStatus(500); return}

    const passwordHash = bcrypt.hashSync(user.password, 10);

    try {
        const userDB = {
            name: user.name,
            email: user.email,
            password: passwordHash
        }
        await collectionUsers.insertOne(userDB)

    } catch (erro) {res.sendStatus(500); return}

    res.sendStatus(201)
})

app.post("/sign-in", async (req, res) => {
    const {email, password} = req.body

    try{
        const user = await collectionUsers.findOne({email: email})

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();

            await collectionSessions.insertOne({
                userId: user._id,
                token
            })

            res.send({
                "token": token,
                "name": user.name
            })
        } 
        else {res.status(400).send("Email ou senha errados, tente novamente!")}

    }catch (erro) {res.sendStatus(500)}
})

app.post("/wallet", async (req, res) => {
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
})


app.listen(process.env.PORT, () => console.log(`Server running in port: ${process.env.PORT}`))