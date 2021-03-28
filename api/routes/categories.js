const express = require('express');
const router = express.Router();
var path = require('path')

const Category = require('../models/category');
const mongoose = require('mongoose');
const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './media/products/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
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

    Category.find()
    .select('_id name categoryIcon')
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

router.post('/', checkAuth, upload.single('categoryIcon'),(req, res, next)=>{

    var filePath;
        if(req.file!=null){
            filePath = req.file.path;
        }

    Category.find({ name: req.body.name})
    .exec()
    .then((result)=>{
        if(result.length>0){
            return res.status(403).json({
                message: "A category already exists with this name"
            });
        }

        const category = new Category({
            _id: new mongoose.Types.ObjectId(),
            name : req.body.name,
            categoryIcon: filePath
        });
    
        category.save()
        .then((result)=>{
        
            res.status(201).json({
                message : 'Created category successfully',
                createdProduct : {
                    id: result._id,
                    name : result.name,
                    categoryIcon : result.categoryIcon
                }
            });
        });  

    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });

});

router.get('/:categoryId', (req, res, next)=>{
    const id = req.params.categoryId;
    Category.findById(id)
    .select('_id name categoryIcon')
    .exec()
    .then((doc)=>{
        
        if(doc)
            res.status(200).json(doc);
        else 
            res.status(404).json({
                message : "The category with id "+req.params.categoryId+" doesnt exist."
            });    
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch('/:categoryId', checkAuth, (req, res, next)=>{
    const id = req.params.categoryId;

    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    console.log(updateOps);
    console.log(id);

    Category.updateOne({_id : id}, {
        $set: updateOps
    }).exec()
    .then((result)=>{

        console.log(result);

        res.status(200).json({
            message : 'Updated category successfully'
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