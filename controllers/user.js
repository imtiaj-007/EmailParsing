const authorizeUser = require('../services/googleAuth');

const googleAuth = async (req, res)=> {
    try {
        const client = await authorizeUser();
        return res.status(200).json({
            success: true,
            client
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
}

const outlookAuth = async (req, res)=> {
    //TODO
    res.end("Service will be available shortly");
}

module.exports = {
    googleAuth,
    outlookAuth
}