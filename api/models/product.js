const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name : { type: String, required: true },
    description : { type: String, default:"" },
    price : { type: Number, required: true },
    productImage: { type: String, required: true },
    categories: { type: Array, required: true}
});

productSchema.plugin(mongoosePaginate);

module.exports =  mongoose.model('Product', productSchema);