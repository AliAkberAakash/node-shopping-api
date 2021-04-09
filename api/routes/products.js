const express = require('express');
const router = express.Router();
var path = require('path')

const Product = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');
const validateCategory = require('../middleware/validate-category');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './media/products/')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const fileFilter = (req, file, cb)=>{
  console.log(file.mimetype);  
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')  
    cb(null, true);
  else
    cb(new Error('File type not supported'), false);  
};

const upload = multer({
    storage : storage,
    limits: {
        fileSize: 1024*1024*3
    },
    fileFilter: fileFilter
});

router.get('/', (req, res, next)=>{

    var perPage = req.query.perpage;
    var page = req.query.page >= 1 ? req.query.page : 1;

    page = page - 1

    // convert to numeric
    page = parseInt(page);
    perPage = parseInt(perPage);

    console.log(page);
    console.log(perPage);

    Product.find()
    .select('_id name description price productImage categories')
    .sort({ name: "asc" })
    .limit(perPage)
    .skip(perPage*page)
    .exec()
    .then((docs)=>{
        const resopnse = {
            count: docs.length,
            products : docs
        }
        res.status(200).json(resopnse);
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next)=>{

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name : req.body.name,
        description: req.body.description,
        price : req.body.price,
        productImage: req.file.path,
        categories: req.body.categories
    });

    product.save()
    .then((result)=>{
    
        res.status(201).json({
            message : 'Created product successfully',
            createdProduct : {
                id: result._id,
                name : result.name,
                description: result.description,
                price : result.price,
                categories: result.categories,
                productImage : result.productImage
            }
        });
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });

    console.log(product);    
    console.log(req.body);   

});

router.get('/:productId', (req, res, next)=>{
    const id = req.params.productId;
    Product.findById(id)
    .select('_id name price productImage')
    .exec()
    .then((doc)=>{
        
        if(doc)
            res.status(200).json(doc);
        else 
            res.status(404).json({
                message : "The product with id "+req.params.productId+" doesnt exist."
            });    
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch('/:productId', checkAuth, (req, res, next)=>{
    const id = req.params.productId;

    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    Product.updateOne({_id : id}, {
        $set: updateOps
    }).exec()
    .then((result)=>{
        res.status(200).json({
            message : 'Updated product successfully'
        });
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

router.delete('/:productId', checkAuth, (req, res, next)=>{
    const id = req.params.productId;
    Product.deleteOne({
        _id : id
    }).exec()
    .then((result)=>{
        res.status(200).json({
            message: "Deleted product successfully"
        });
    })
    .catch((err)=>{
        console.log(err);
        es.status(500).json({
            error : err
        });
    });
});

module.exports = router;