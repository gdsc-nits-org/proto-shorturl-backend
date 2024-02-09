// middleware: req, res, next


export const getusermiddleware = (req, res, next) => {
    const { username } = req.body;
    if(!username) {
        return res.json("Username is null")
    } else {
        return next();
    }
}
