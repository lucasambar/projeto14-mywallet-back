export async function  userSignUp (req, res) {
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

    } catch (erro) {res.sendStatus(500)}
}