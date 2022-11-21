import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import joi from 'joi';
import routerUsers from './routes/usersRoutes.js'
import routerWallet from './routes/walletRoutes.js'

//config
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

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
app.use(routerUsers)
app.use(routerWallet)

app.listen(process.env.PORT, () => console.log(`Server running in port: ${process.env.PORT}`))