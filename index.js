const replyToUnreadMails = require('./services/gmailService');
const authorizeUser = require('./services/googleAuth');


async function main() {
    const auth = await authorizeUser();
    await replyToUnreadMails(auth);
}
main().catch((error)=>{
    console.log(error);
})

