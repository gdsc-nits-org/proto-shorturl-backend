import prisma from "prisma/prismaClient"

const createuser = async (req, res) => {
    console.log(req.body)
    const { username, email, password } : {
        username: string,
        email: string,
        password: string
    
    }= req.body;
    console.log(username, email, password)
    const data = await prisma.user.create({
        data: {
            username,
            email,
            password
        }
    })
    console.log(data)
    return res
        .status(200)
        .json({
            "msg": "Success"
        })
}

export { createuser }