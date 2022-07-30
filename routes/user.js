const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/Users.js');
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../helpers/auth.js');

router.post('/register', async (req,res)=>{
    const { email , password } = req.body
    
    // 01. Check Email
    const existEmail = await User.findOne({ email });
    if(existEmail) return res.send({
        success : false,
        responseText : 'This Account was Registered'
    })

    // 02. Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt)

    // 03. Save Info to DB
    const user = new User({ email, password : hashPass})
    const userSave = await user.save()

    res.send({
        success : true,
        responseData : userSave
    })
})

router.post('/log_in',async (req,res)=>{
    const { email, password } = req.body

    // 01. Check Email
    const user = await User.findOne({ email });
    if(!user) res.send({
        success : false,
        responseText : 'Account Does Not Exist'
    });

    // 02. Check Password
    const decodePass =  bcrypt.compare(password, user.password)
    if(!decodePass) res.send({
        success : false,
        responseText : 'Wrong Password'
    });

    // 03. Generate Token & Update Refresh Token In DB
    const access_token = generateAccessToken(user._id);
    const refresh_token = generateRefreshToken(user._id);

    await User.findOneAndUpdate({ _id : user._id }, { $set: { refresh_token }}, { new : true })

    res.header('Authorization', access_token ).send({
        success : true,
        responseData : {
            access_token,
            refresh_token,
            _id : user._id
        }
    })
})

router.delete('/log_out', async(req,res) => {
    await User.findByIdAndUpdate({ _id : req.body._id}, { $set: { refresh_token : '' }})
    res.sendStatus(204)
})

router.post('/post', verifyAccessToken, async (req,res)=>{
    res.status(200).send({ responseText : 'Post Success'})
})

router.post('/refresh_token', verifyRefreshToken, async (req,res)=>{
    try{
        // 01. Get Id From Middle Ware
        const user_decoded = req.user;

        // Generate Two JWT
        const access_token = generateAccessToken(user_decoded._id);
        const refresh_token = generateRefreshToken(user_decoded._id);

        // Update JWT Field Of DB
        await User.findOneAndUpdate({ _id : user_decoded._id }, { $set: { refresh_token }}, { new : true })

        res.header('Authorization', refresh_token ).status(200).send({
            success : true,
            responseData : {
                access_token,
                refresh_token,
            }
        })
    }catch(err){
        if(err) return res.sendStatus(403);
    }
})

module.exports = router