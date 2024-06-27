const { google } = require('googleapis');
const { getAILabel, generateReply } = require('./geminiAI');


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
            let labelId;
            res.data.labels.map((label) => {
                if (label === label_name)
                    labelId = label.id;
            })
            return labelId;
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
        q: 'is:unread '
    });

    const unreadMails = res.data.messages || [];
    console.log(unreadMails);

    let delay = 0;
    for (let mail of unreadMails) {

        async function doTasks(mail) {
            const { subject, from, data } = await getMessage(auth, mail.id);
            const replyTo = from.match(/<(.*)>/)[1];
            const modSubject = `Re: ${subject}`;

            const label = await getAILabel(data);               // Generate proper label from Gemini AI            
            const labelId = await createLabel(auth, label);     // Get the label Id    

            await addLabel(auth, mail, labelId);                // Add the label to the mail

            const replyBody = await generateReply(data);        // Generate reply using AI
            await sendMail(auth, replyTo, modSubject, replyBody);  // Finally send the reply to reciepents

            await gmail.users.messages.modify({                 // Set the mail as read
                id: mail.id,
                userId: 'me',
                requestBody: {
                    removeLabelIds: ['UNREAD'],
                },
            });
        }

        setTimeout(async () => {        // Delaying the execution of each mail
            await doTasks(mail);
          }, delay);
        
          delay += 15000; // Add 15 seconds to delay for next iteration
    }
}


module.exports = replyToUnreadMails;