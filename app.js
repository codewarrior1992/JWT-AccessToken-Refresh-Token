const express = require('express');
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();

// Middle Ware
app.use(express.json());
app.use(express.urlencoded({ extended: true,}));
app.use(cookieParser());
app.use(cors())

// Routes
const user = require('./routes/user.js');
app.use('/user', user)

mongoose.connect(process.env.DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
}).then(()=>{
    app.listen(port,()=>{
        console.log(`Is listening ${port} now`)
    })
})

