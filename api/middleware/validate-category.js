const express = require('express');
const app = express();
var multer  = require('multer');
const Category = require('../models/category');


module.exports = (req, res, next)=>{
    const categories = req.body.categories;
    console.log(req);
    console.log(categories);
    if(!categories)
        return res.status(403).json({
            message: "Must select a category"
        });
    next();    
}