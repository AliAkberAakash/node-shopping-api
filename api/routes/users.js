const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const checkAuth = require('../middleware/check-auth');

router.get('/', (req, res, next)=>{
    User.find()
    .select('_id email')
    .exec()
    .then((result)=>{
        res.status(200).json({
            userCount : result.length,
            users: result
        })
    })
    .catch((err)=>{
        res.status(500).json({
            error :  err
        });
    });
});

router.post('/signup', (req, res, next)=>{

    User.find({email: req.body.email})
    .exec()
    .then((result)=>{
        if(result.length>0){
            return res.status(409).json(
                {
                    message: "An account already exists with this email"
                }
            );
        }else{
            bcrypt.hash(req.body.password, 10, (err, hash)=>{
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                }else{
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                    .then((result)=>{
                        res.status(200).json({
                            message: "User Created Successfully"
                        });
                    })
                    .catch((err)=>{
                        res.status(500).json({
                            error : err
                        });
                    });        
        
                }
            });
        }
    });
   
});

router.post('/login', (req, res, next)=>{
    User.find({email: req.body.email})
    .exec()
    .then((user)=>{
        if(user.length<1){
            return res.status(401).json({
                "message" : "Failed to login"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result)=>{
            if(err){
                return res.status(401).json({
                    message : "Auth error"
                });
            }
            if(result){
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id 
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "24h"
                }
                );
                return res.status(200).json({
                    message: "Login Successful",
                    token: token
                });
            }
            return res.status(401).json({
                    message : "Failed to login"
                });
        });
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        });
    });
});

router.delete('/:userId', (req, res, next)=>{
    const userId = req.params.userId;
    User.findById(userId)
    .exec()
    .then((result)=>{
        if(result)
        User.remove({_id: userId})
        .exec()
        .then((result)=>{
            res.status(200).json({
                message: "Deleted user with id "+userId
            });
        })
        else{
            res.status(404).json({
                message: "User not found"
            });
        }    
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        });
    });


});

module.exports = router;