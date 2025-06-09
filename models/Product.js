const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'el nombre es obligatorio'],
        trim: true,
        unique: true
    },
    description: {
        type: String, 
        required: [true, 'la descripcion es obligatoria'],
        trim: true
    },
    price: {
        type: Number, 
        required: [true, 'el precio es obligatorio'],
        min: [0, 'el precio no puede ser negativo']
    },
    stock: {
        type: Number, 
        required: [true, 'el stock es obligatorio'],
        min: [0, 'el stock no puede ser negativo']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'la categoria es obligatoria']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: [true, 'la subcategoria es obligatoria']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [{
        type: String,
    }]
}, {
    timestamps: true,
    versionKey: false
});

//Manejo de errores
productSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoServerError' && error.code === 11000){
        return next(new Error('Ya existe un producto con ese nombre'));
    }
    next(error);
});


module.exports = mongoose.model('Product', productSchema);