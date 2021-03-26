const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next)=>{
    Order.find()
    .select('_id productId quantity')
    .exec()
    .then((result)=>{
        res.status(200).json({
            orderCount : result.length,
            orders: result
        })
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        });
    });
});

router.post('/', (req, res, next)=>{

    Product.findById(req.body.productId)
    .exec()
    .then((product)=>{
        if(!product){
            return res.status(400).json({
                message: "Product not found"
            });
        }

        const order = new Order({
            _id : mongoose.Types.ObjectId(),
            quantity : req.body.quantity,
            productId : req.body.productId, 
        });
        return order.save();
    })
    .then((result)=>{
        res.status(201).json({
            message : "Order recieved successfully",
            order: {
                id : result._id,
                productId: result.productId,
                quantity: result.quantity
            }
        });
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        });
    });


});


router.get('/:orderId', (req, res, next)=>{
    Order.findById(req.params.orderId)
    .select('productId quantity')
    .exec()
    .then((result)=>{
        if(result)
            res.status(200).json({
                message : 'Orders details',
                order: result
            });
        else{
            res.status(404).json({
                message: "Order not found"
            });
        }    
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        });
    });
    
});

router.delete('/:orderId', (req, res, next)=>{

    Order.findById(req.params.orderId)
    .exec()
    .then((result)=>{
        if(result)
        Order.remove({_id: req.params.orderId})
        .exec()
        .then((result)=>{
            console.log(result);
            res.status(200).json({
                message: "Deleted order with id "+req.params.orderId
            });
        })
        else{
            res.status(404).json({
                message: "Order not found"
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