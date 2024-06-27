const { google } = require('googleapis');

// Send mail to a reciepent
const sendMail = async (auth, reciever, subject, mailBody) => {
    const gmail = google.gmail({ version: 'v1', auth });    

    const rawMessage = [
        `From: me`,
        `To: ${reciever}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        `${mailBody}`,
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '-').replace(/=+$/, '');

    const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage
        }
    });
    console.log(response.data);
}


const createLabel = async (auth, label_name)=> {
    const gmail = google.gmail({ version: 'v1', auth });
    try {
        const res = await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name: label_name,
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show'
            }
        })
        return res.data.id;
    } catch (error) {
        if (error.code === 409) {
            //label already exist
            const res = await gmail.users.labels.list({
                userId: 'me'
            })
            const label = res.data.labels.find((label) => label.name === label_name);
            return label.id;
        } else {
            throw error;
        }
    }
}


// Add label to a message and move it to the label folder 
const addLabel = async (auth, mail, labelId) => {
    try {
        const gmail = google.gmail({ version: 'v1', auth });
        await gmail.users.messages.modify({
            id: mail.id,
            userId: 'me',
            requestBody: {
                addLabelIds: [labelId],
                removeLabelIds: ['INBOX'],
            },
        });
    } catch (error) {
        console.log(error);
    }
}


// Get Interested Mails
const getInterestdMails = async (auth) => {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        q: '-label:Interested '
    });
    return res.data.messages || [];
}


// Get Test Mails
const getTestMails = async (auth) => {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        q: '-label:Test '
    });
    return res.data.messages || [];
}


// Reply to Unread Mails
const replyToUnreadMails = async (auth) => {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        q: '-is:unread '
    });
    
    // const interestedlabelId = await createLabel(auth, "Interested");
    // const notInterestedlabelId = await createLabel(auth, "Not Interested");
    // const moreInformationlabelId = await createLabel(auth, "More Information");
    const testlabelId = await createLabel(auth, "Test");

    const unreadMails = await getTestMails(auth);
    unreadMails.map(async (mail) => {
        await addLabel(auth, mail, testlabelId);
    });

    // const interestedMails = await getInterestdMails(auth);
    const testMails = await getTestMails(auth);
    console.log(testMails);

}


module.exports = replyToUnreadMails;