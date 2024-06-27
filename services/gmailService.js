const { google } = require('googleapis');
const { getAILabel } = require('./geminiAI');


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


const createLabel = async (auth, label_name) => {
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

// Get Message from a mail
const getMessage = async (auth, mailId) => {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.get({
        userId: 'me',
        id: mailId,
        format: 'full'
    });

    // Get Sender and Subject from headers
    const subject = res.data.payload.headers.find((header) => header.name === 'Subject').value;
    const from = res.data.payload.headers.find((header) => header.name === 'From').value;

    // Get Message body from payload part
    const rawBody = res.data.payload.parts[0].body.data;
    const data = Buffer.from(rawBody, 'base64').toString('ascii');

    return { subject, from, data };
}


// Reply to Unread Mails
const replyToUnreadMails = async (auth) => {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({
        userId: 'me',
        q: '-in:chat -from:me '
    });

    const interestedlabelId = await createLabel(auth, "Interested");
    const notInterestedlabelId = await createLabel(auth, "Not Interested");
    const moreInformationlabelId = await createLabel(auth, "More Information");

    const unreadMails = res.data.messages || [];
    console.log(unreadMails);


    for (let mail of unreadMails) {
        const { subject, from, data } = await getMessage(auth, mail.id);
        console.log(subject, " : ", data);
        
        const label = await getAILabel(data);   // Generate proper label from Gemini AI
        await addLabel(auth, mail, label);      // Add the label to the mail

        
        
    }

    // const interestedMails = await getInterestdMails(auth);    
}


module.exports = replyToUnreadMails;