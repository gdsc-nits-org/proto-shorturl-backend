// function which takes 2 params: req and res
import prisma from "prisma/prismaClient"

const getuser = async (req, res) => {
    const { username } = req.body;
    const data = await prisma.user.findFirst({
        where: {
            username,
        }
    })
    console.log(data)
    return res.json(data)
}

export {getuser}