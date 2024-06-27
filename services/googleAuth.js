const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');


// Access scopes for Mail activity.
const SCOPE = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.labels'
];

// Fetch and Store tokens from files
const TOKEN_PATH = path.join(process.cwd(), './credentials/googleToken.json');
const CREDENTIALS_PATH = path.join(process.cwd(), './credentials/clientSecret.json');


// Read saved credentials from file
const loadSavedCredentials = async ()=> {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        console.log(content)
        if(!content)
            return null;

        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (error) {
        console.error(error);
        return null;
    }
}


// Save credentials
const saveCredentials = async (client)=> {
    try {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const credentials = JSON.parse(content);
        const key = credentials.web || credentials.installed;

        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });

        await fs.writeFile(TOKEN_PATH, payload);
    } catch (error) {
        console.error(error);
        return null;
    }
}


// Authorize a new/existing user
const authorizeUser = async ()=> {
    try {
        let client = await loadSavedCredentials();
        if(client) {
            return client;
        }
        client = await authenticate({
            scopes: SCOPE,
            keyfilePath: CREDENTIALS_PATH
        });
    
        if(client.credentials) {
            await saveCredentials(client);
        }
        console.log(client);
        return client;

    } catch (error) {
        console.error(error);
        return null;        
    }
}

module.exports = authorizeUser;