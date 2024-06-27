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


// Generate reply mail from AI
const generateReply = async (message) => {    

    const chatSession = model.startChat({
        history: mailReplyDemo,
        generationConfig: {
            temperature: 2,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 100,
            responseMimeType: "text/plain",
        },
    });

    const prompt = `Based on the email content (summarized in the following): ${message} - write a personalized response email body, don't add subject and greetings.`

    const result = await chatSession.sendMessage(prompt);
    const text = result.response.text();
    return text;
}


// Demo chat history for mail replies
const mailReplyDemo = [
    {
        role: "user",
        parts: [
            {
                text: `Based on the email content (summarized in the following): I'm writing to you today because I'm interested in learning more about Email Parser. I came across your website while searching for solutions to Automated Email Service. Email Parser seems like it could be a good fit for my needs. - write a personalized response email body, don't add subject and greetings.`
            },
        ],
    },
    {
        role: "model",
        parts: [
            {
                text: `Thanks for your interest in Automated Email Parser! We're glad you found us \n
                Would you be interested in scheduling a demo call to see how our product can help you achieve your goals?\n
                Please let me know which time slot works best for you, or if you have any other questions.\n\n`
            },
        ],
    },
    {
        role: "user",
        parts: [
            {
                text: `Based on the email content (summarized in the following): Hello, I'm pretty impressed by Email Parser. It has the potential to help me grow my business, and also in my personal tasks. I'm willing to try it. I'll be glad if you guide me through further steps. Thanks in advance. - write a personalized response email body, don't add subject and greetings.`
            },
        ],
    },
    {
        role: "model",
        parts: [
            {
                text: `Thanks so much for your email and your interest in Email Parser! We're thrilled to hear that you're impressed with its potential to help you grow your business and streamline your personal tasks.\n
                We'd be happy to guide you through the next steps and show you how Email Parser can make a real difference in your workflow!\n 
                We're confident that Email Parser can be a valuable asset, and we're here to support you every step of the way.\n\n`
            },
        ],
    },
    {
        role: "user",
        parts: [
            {
                text: `Based on the email content (summarized in the following): Thanks for reaching out and introducing me to Email parser. I appreciate you taking the time to learn more about my needs. While your Product seems like a great solution, it's not quite the right fit for our current requirements. I wish you the best of luck in the future. - write a personalized response email body, don't add subject and greetings.`
            },
        ],
    },
    {
        role: "model",
        parts: [
            {
                text: `Thank you for considering Email Parser! We appreciate you taking the time to explore our product and share your feedback.\n
                While we understand Email Parser might not be the perfect fit for your current needs, we're glad you found it interesting.\n
                In the future, if your requirements change and you're looking for solutions in the email automation or management space, please don't hesitate to revisit us. We'd be happy to see if Email Parser can be a better fit then.\n
                In the meantime, we wish you the best of luck in achieving your goals!\n\n`
            },
        ],
    },
    {
        role: "user",
        parts: [
            {
                text: `Based on the email content (summarized in the following): Thank you for contacting me about Email Parser. We appreciate you bringing it to our attention. We currently have a solution in place for our needs and are satisfied with its performance. We wish you success with your product. - write a personalized response email body, don't add subject and greetings.`
            },
        ],
    },
    {
        role: "model",
        parts: [
            {
                text: `Thanks for letting us know about your current solution for your needs. We appreciate you considering Email Parser!\n It's great that you have a solution that's working well for you. We're always happy to see businesses leveraging tools that meet their needs.\n While Email Parser might not be a fit right now, we're constantly evolving our product. If your needs change in the future, or you're looking for additional functionalities, please keep us in mind.\n In the meantime, we wish you continued success and best of luck in achieving your goals!\n\n`
            },
        ],
    },
    {
        role: "user",
        parts: [
            {
                text: `Based on the email content (summarized in the following): I hope this email finds you well. I recently came across Email Parser and I'm curious to learn a little more about it. It seems like it might be helpful, but I'm not entirely sure. Would you be able to provide a brief overview of your service and its main functionalities? Thanks in advance for your time. - write a personalized response email body, don't add subject and greetings.`
            },
        ],
    },
    {
        role: "model",
        parts: [
            {
                text: `Thanks for reaching out and for your interest in Email Parser! We're happy to hear you've discovered our service.\n Email Parser is designed to help you streamline your email workflow and extract valuable information from your inbox. Here's a quick overview of its main functionalities:\n Automated Organization: Email Parser automatically sorts and categorizes your emails, saving you time spent manually managing your inbox.\n Actionable Insights: Extract key data points and generate summaries from your emails, making it easier to track progress and stay on top of important information.\n Improved Efficiency: Automate repetitive tasks like data entry and lead generation, freeing up your time for more strategic work.\n Integration Capabilities: Connect Email Parser with your existing tools and CRM platforms for a seamless workflow.\n We can also tailor Email Parser to your specific needs. Would you like to tell me a little more about what you're hoping to achieve with your email management? This way, we can provide a more specific example of how Email Parser can benefit you.\n\n`
            },
        ],
    },
    {
        role: "user",
        parts: [
            {
                text: `Based on the email content (summarized in the following): I'm writing to inquire about Email Parser and its potential application. I'm constantly looking for ways to send personalized automated email response. I believe your Product could be a valuable tool. I'd appreciate it if you could share some information about how your Product has helped companies in similar situations. Thank you for your time and consideration. - write a personalized response email body, don't add subject and greetings.`
            },
        ],
    },
    {
        role: "model",
        parts: [
            {
                text: `Thanks for reaching out and for your interest in Email Parser! We're happy to hear you've discovered our service.\n Email Parser is designed to help you streamline your email workflow and extract valuable information from your inbox. Here's a quick overview of its main functionalities:\n Automated Organization: Email Parser automatically sorts and categorizes your emails, saving you time spent manually managing your inbox.\n Actionable Insights: Extract key data points and generate summaries from your emails, making it easier to track progress and stay on top of important information.\n Improved Efficiency: Automate repetitive tasks like data entry and lead generation, freeing up your time for more strategic work.\n Integration Capabilities: Connect Email Parser with your existing tools and CRM platforms for a seamless workflow.\n We can also tailor Email Parser to your specific needs. Would you like to tell me a little more about what you're hoping to achieve with your email management? This way, we can provide a more specific example of how Email Parser can benefit you.\n\n`
            },
        ],
    },
]


module.exports = {
    getAILabel,
    generateReply
};