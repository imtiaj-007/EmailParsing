require('dotenv').config();
const express = require('express')
const userRouter = require('./routers/user');

const PORT = process.env.PORT;

const app = express();


app.use('/user', userRouter);

app.listen(PORT, ()=> {
    console.log(`Server started at PORT: ${PORT}`);
})

