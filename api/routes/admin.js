const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose');

const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const Order = require('../models/order');


AdminBro.registerAdapter(AdminBroMongoose);

const AdminBroOptions = {

    resources: [User, Product, Category, Order],
  }
const adminBro = new AdminBro(AdminBroOptions)

const router = AdminBroExpress.buildRouter(adminBro)

module.exports =router;