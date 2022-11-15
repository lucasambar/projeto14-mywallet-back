import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

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


app.listen(process.env.PORT, () => console.log(`Server running in port: ${process.env.PORT}`))