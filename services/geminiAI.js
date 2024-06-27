require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Generate label from AI
const getAILabel = async (message) => {
    const chatSession = model.startChat({
        history: [
            {
                role: "user",
                parts: [
                    { text: "Analyze the sentiment of the following Tweets and classify them as POSITIVE, NEGATIVE, or NEUTRAL. \"It's so beautiful today!\"" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "POSITIVE" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "\"It's so cold today I can't feel my feet...\"" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "NEGATIVE" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "\"The weather today is perfectly adequate.\"" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "NEUTRAL" },
                ],
            },
            {
                role: "user",
                parts: [
                    { text: "Analyze the following mails and classify them as Interested, Not Interested, or More Information. - I'm not interested to proceed further." },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "Not Interested \n" },
                ],
            },
        ],
        generationConfig: {
            temperature: 2,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 100,
            responseMimeType: "text/plain",
        },
    });

    const prompt = `Analyze the following mails and classify them as Interested, Not Interested, or More Information. - ${message}`;

    const result = await chatSession.sendMessage(prompt);
    const text = result.response.text();
    return text;
}


module.exports = {
    getAILabel
};