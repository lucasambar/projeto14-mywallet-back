import { userSchema } from "..";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { collectionUsers, collectionSessions } from "../db/dbs";

export async function  userSignUp (req, res) {
    const user = req.body

    const passwordHash = bcrypt.hashSync(user.password, 10);

    try {
        console.log("chegou aqui")
        const userDB = {
            name: user.name,
            email: user.email,
            password: passwordHash
        }
        await collectionUsers.insertOne(userDB)

    } catch (erro) {console.log(erro); res.sendStatus(500); return}

    res.sendStatus(201)
}

export async function userSignIn (req, res) {
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

    } catch (erro) {res.sendStatus(500); console.log(erro)}
}