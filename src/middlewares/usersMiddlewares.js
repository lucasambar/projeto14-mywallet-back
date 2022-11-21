import {userSchema} from "../index.js"
import {collectionUsers} from "../db/dbs.js"

export async function userSignUpMiddleware (req, res, next) {
    const user = req.body

    const validation = userSchema.validate(req.body, {abortEarly: false})

    if (validation.error) {
        res.status(422).send("Confira se os dados estão preenchidos corretamente e tente novamente!");
        return;
    }

    try {
        const exist = await collectionUsers.findOne({email: user.email})
        if (exist) {
            res.status(409).send("Usuário já cadastrado!"); 
            return
        }

    } catch (erro) {console.log(erro); res.sendStatus(500); return}

    next()
}



