import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

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


app.listen(process.env.PORT, () => console.log(`Server running in port: ${process.env.PORT}`))