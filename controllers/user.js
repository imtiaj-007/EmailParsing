const authorizeUser = require('../services/googleAuth');

const googleAuth = async (req, res)=> {
    try {
        const client = await authorizeUser();
        res.status(200).json({
            success: true,
            client
        })
    } catch (error) {
        console.log(error);
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