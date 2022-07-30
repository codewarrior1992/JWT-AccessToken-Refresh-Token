const User = require('../models/Users.js');
const jwt = require('jsonwebtoken');

function generateAccessToken (_id){
    return jwt.sign({ _id }, process.env.SECRET_CODE, { expiresIn: '15s' })
}

function generateRefreshToken (_id){
    return jwt.sign({ _id }, process.env.SECRET_CODE, { expiresIn: '30s' })
}

function verifyAccessToken (req,res,next){
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token, process.env.SECRET_CODE);
        req.user = decoded
        next()
    }catch(err){
        if(err) return res.sendStatus(401)
    }
}

async function verifyRefreshToken (req,res,next){
    try{
        // Decoded JWT From FrontEnd
        const refresh_token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(refresh_token, process.env.SECRET_CODE); 

        // Find JWT From DB
        const user = await User.find({ _id : decoded._id });
        const user_token = user[0].refresh_token;

        // Compare JWT
        if (refresh_token !== user_token) return res.sendStatus(403);
        req.user = decoded;
        next()

    } catch (err) {
        if(err) return res.sendStatus(403);
    }
}

module.exports.generateAccessToken = generateAccessToken;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;

