import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';


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
export const userSchema = joi.object({
    "name": joi.string().required().min(3),
    "email": joi.string().email().required(),
    "password": joi.string().required().min(3).alphanum(),
    "confirmePassword": joi.ref("password")
})
export const walletSchema = joi.object({
    "type": joi.string().valid("entrance","exit").required(),
    "amount": joi.number().precision(2).required(),
    "description": joi.string().min(5).required() 
})
//routes


app.listen(process.env.PORT, () => console.log(`Server running in port: ${process.env.PORT}`))