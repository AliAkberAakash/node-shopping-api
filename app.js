const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

const uri = "mongodb+srv://node-shopping-app:"+process.env.MONGO_ATLAS_PASSWORD+"@node-shopping-app.azn9o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
console.log(uri)

mongoose.connect(uri,
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
mongoose.Promise = global.Promise;

// const adminRoutes = require('./api/routes/admin');
// app.use('/admin', adminRoutes);

app.use(morgan('dev'));
app.use('/media', express.static('media'));
app.use(express.urlencoded({extended : false}));
app.use(express.json());


app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
    if(req.method === 'OPTIONS'){
        res.header(
            "Access-Control-Allow-Methods", 
            "PUT, POST, PATCH, DELETE, GET"
        );
        return res.status(200).json({});
    }   
    next(); 
});

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);


app.use((req, res, next)=>{
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message : error.message
        }
    });
});

module.exports = app;