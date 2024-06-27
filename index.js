const replyToUnreadMails = require('./services/gmailService');
const authorizeUser = require('./services/googleAuth');


async function main() {
    const auth = await authorizeUser();
    await replyToUnreadMails(auth);
}
main().catch((error)=>{
    console.log(error);
})



// const intervalId = setInterval(()=> {
//     async function sendMail() {
//         const auth = await authorizeUser();
//         await replyToUnreadMails(auth);
//     }
//     sendMail();
// }, 100000)
