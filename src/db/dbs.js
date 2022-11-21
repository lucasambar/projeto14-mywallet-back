import { MongoClient } from "mongodb";
import dotenv from "dotenv"

dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try {
    db = await mongoClient.connect()
    console.log("Projeto conectado ao Mongo DB!")
} catch (erro) {console.log(erro)}

export const collectionUsers = mongoClient.db("myWallet").collection("users")
export const collectionSessions = mongoClient.db("myWallet").collection("sessoons")
export const collectionWallet = mongoClient.db("myWallet").collection("wallet")
export const collectionBalance = mongoClient.db("myWallet").collection("balance")